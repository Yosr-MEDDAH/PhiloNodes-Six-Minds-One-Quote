import logging
from typing import Dict, List, Optional, Tuple

from config import QUORUM_THRESHOLD, MIN_VOTES_REQUIRED, MAX_VOTES

logger = logging.getLogger(__name__)


class ConsensusProtocol:
    def __init__(self):
        """Initialise le protocole de consensus"""
        self.quorum_threshold = QUORUM_THRESHOLD
        self.min_votes_required = MIN_VOTES_REQUIRED
        
        logger.info(
            f"ConsensusProtocol initialisé: quorum={QUORUM_THRESHOLD*100}%, "
            f"votes_min={MIN_VOTES_REQUIRED}"
        )
    
    def aggregate_votes(self, responses: Dict[int, Optional[Dict]]) -> Dict:
        logger.info(f"Agrégation des votes de {len(responses)} philosophes...")
        
        valid_responses = {
            phil_id: resp 
            for phil_id, resp in responses.items() 
            if resp is not None
        }
        
        total_votes = len(valid_responses)
        
        if total_votes == 0:
            logger.error("Aucune réponse valide reçue!")
            return self._no_consensus_result()
        
        votes_detail = []
        accepts = 0
        rejects = 0
        candidates = {}  
        
        for phil_id, response in valid_responses.items():
            vote = response.get("vote", "Abstain")
            score = response.get("score", 0.0)
            quote = response.get("quote")
            philosopher_name = response.get("philosopher_name", "Inconnu")
            reasoning = response.get("reasoning", "")
            
            votes_detail.append({
                "philosopher_id": phil_id,
                "philosopher_name": philosopher_name,
                "vote": vote,
                "score": score,
                "reasoning": reasoning,
                "quote_id": quote.get("quoteId") if quote else None
            })
            
            if vote == "Accept":
                accepts += 1
                
                if quote:
                    quote_id = quote.get("quoteId")
                    if quote_id not in candidates:
                        candidates[quote_id] = {
                            "quote": quote,
                            "total_score": 0.0,
                            "supporters": [],
                            "votes_count": 0
                        }
                    
                    candidates[quote_id]["total_score"] += score
                    candidates[quote_id]["votes_count"] += 1
                    candidates[quote_id]["supporters"].append({
                        "philosopher": philosopher_name,
                        "score": score
                    })
            
            elif vote == "Reject":
                rejects += 1
        
        quorum_percentage = accepts / total_votes if total_votes > 0 else 0
        quorum_reached = (
            quorum_percentage >= self.quorum_threshold and 
            accepts >= self.min_votes_required
        )
        
        logger.info(
            f"Résultats du vote: {accepts} Accepte, {rejects} Rejette, "
            f"Quorum: {quorum_percentage*100:.1f}% (seuil: {self.quorum_threshold*100}%)"
        )
        
        if not quorum_reached:
            logger.warning("Quorum non atteint! Pas de consensus.")
            return self._build_result(
                winner=None,
                votes_detail=votes_detail,
                accepts=accepts,
                rejects=rejects,
                total_votes=total_votes,
                quorum_reached=False
            )
        
        winner_quote = self._select_winner(candidates)
        
        if not winner_quote:
            logger.warning("Aucun gagnant valide trouvé malgré le quorum!")
            return self._build_result(
                winner=None,
                votes_detail=votes_detail,
                accepts=accepts,
                rejects=rejects,
                total_votes=total_votes,
                quorum_reached=quorum_reached
            )
        
        logger.info(f" Consensus atteint! Gagnant: Citation #{winner_quote['quote_id']}")
        
        return self._build_result(
            winner=winner_quote,
            votes_detail=votes_detail,
            accepts=accepts,
            rejects=rejects,
            total_votes=total_votes,
            quorum_reached=quorum_reached
        )
    
    def _select_winner(self, candidates: Dict) -> Optional[Dict]:
        if not candidates:
            return None
        
        best_quote_id = None
        best_avg_score = 0.0
        best_votes_count = 0
        
        for quote_id, data in candidates.items():
            avg_score = data["total_score"] / data["votes_count"]
            votes_count = data["votes_count"]
            
            if (avg_score > best_avg_score) or \
               (avg_score == best_avg_score and votes_count > best_votes_count):
                best_quote_id = quote_id
                best_avg_score = avg_score
                best_votes_count = votes_count
        
        if best_quote_id is None:
            return None
        
        winner_data = candidates[best_quote_id]
        
        return {
            "quote_id": best_quote_id,
            "quote": winner_data["quote"],
            "average_score": round(best_avg_score, 2),
            "votes_count": best_votes_count,
            "supporters": winner_data["supporters"]
        }
    
    def _build_result(
        self,
        winner: Optional[Dict],
        votes_detail: List[Dict],
        accepts: int,
        rejects: int,
        total_votes: int,
        quorum_reached: bool
    ) -> Dict:
        quorum_percentage = accepts / total_votes if total_votes > 0 else 0
        
        result = {
            "winner": winner,
            "consensus": {
                "total_votes": total_votes,
                "accepts": accepts,
                "rejects": rejects,
                "abstains": total_votes - accepts - rejects,
                "quorum_percentage": round(quorum_percentage * 100, 1),
                "quorum_reached": quorum_reached,
                "threshold": self.quorum_threshold * 100
            },
            "votes_detail": sorted(
                votes_detail, 
                key=lambda x: x.get("score", 0), 
                reverse=True
            )
        }
        
        return result
    
    def _no_consensus_result(self) -> Dict:
        return {
            "winner": None,
            "consensus": {
                "total_votes": 0,
                "accepts": 0,
                "rejects": 0,
                "abstains": 0,
                "quorum_percentage": 0.0,
                "quorum_reached": False,
                "threshold": self.quorum_threshold * 100
            },
            "votes_detail": [],
            "error": "Aucune réponse valide des nœuds philosophes"
        }

if __name__ == "__main__":
    
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    print("="*60)
    print("TEST DU PROTOCOLE DE CONSENSUS")
    print("="*60)
    
    mock_responses = {
        1: { 
            "philosopher_name": "Aristotle",
            "vote": "Accept",
            "score": 7.5,
            "reasoning": "Promeut la vertu",
            "quote": {
                "quoteId": 10,
                "text": "Le bonheur s'atteint par la vertu",
                "source": "Éthique à Nicomaque",
                "categoryName": "Happiness and well-being"
            }
        },
        2: { 
            "philosopher_name": "Immanuel Kant",
            "vote": "Accept",
            "score": 6.2,
            "reasoning": "S'aligne avec le devoir",
            "quote": {
                "quoteId": 20,
                "text": "La vertu, non le bonheur, est le bien suprême",
                "source": "Critique de la raison pratique",
                "categoryName": "Happiness and well-being"
            }
        },
        3: { 
            "philosopher_name": "Friedrich Nietzsche",
            "vote": "Reject",
            "score": 4.0,
            "reasoning": "Trop faible",
            "quote": {
                "quoteId": 30,
                "text": "Le bonheur n'est pas le but",
                "source": "Ecce Homo",
                "categoryName": "Happiness and well-being"
            }
        },
        5: {  
            "philosopher_name": "Leo Tolstoy",
            "vote": "Accept",
            "score": 9.2,
            "reasoning": "Incarne l'amour et le service",
            "quote": {
                "quoteId": 50,
                "text": "La joie vient du service aux autres",
                "source": "Le Royaume de Dieu",
                "categoryName": "Happiness and well-being"
            }
        },
        6: {  
            "philosopher_name": "Confucius",
            "vote": "Accept",
            "score": 8.1,
            "reasoning": "Promeut l'harmonie",
            "quote": {
                "quoteId": 60,
                "text": "Le bonheur suit le devoir",
                "source": "La Doctrine du Milieu",
                "categoryName": "Happiness and well-being"
            }
        }
    }
    
   
    protocol = ConsensusProtocol()
    result = protocol.aggregate_votes(mock_responses)
    
    print("\n" + "="*60)
    print("RÉSULTAT DU CONSENSUS:")
    print("="*60)
    
    consensus = result["consensus"]
    print(f"\nVotes: {consensus['accepts']} Accepte, {consensus['rejects']} Rejette")
    print(f"Quorum: {consensus['quorum_percentage']}% (seuil: {consensus['threshold']}%)")
    print(f"Quorum atteint: {' OUI' if consensus['quorum_reached'] else ' NON'}")
    
    if result["winner"]:
        winner = result["winner"]
        print(f"\n GAGNANT:")
        print(f"  ID Citation: {winner['quote_id']}")
        print(f"  Score Moyen: {winner['average_score']}/10")
        print(f"  Votes: {winner['votes_count']}")
        print(f"  Texte: \"{winner['quote']['text']}\"")
        print(f"\n  Supporteurs:")
        for supporter in winner["supporters"]:
            print(f"    - {supporter['philosopher']}: {supporter['score']}/10")
    else:
        print("\n Aucun gagnant sélectionné")
    
    print("\n" + "="*60)
    print("VOTES DÉTAILLÉS:")
    print("="*60)
    
    for vote in result["votes_detail"]:
        print(f"\n{vote['philosopher_name']}:")
        print(f"  Vote: {vote['vote']}")
        print(f"  Score: {vote['score']}/10")
        print(f"  Raisonnement: {vote['reasoning']}")
    
    print("\n" + "="*60)
    print("Test terminé!")
    print("="*60)