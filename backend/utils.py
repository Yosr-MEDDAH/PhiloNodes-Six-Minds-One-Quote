import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

def load_json_file(filepath: str) -> Dict[str, Any]:
    """Charge un fichier JSON"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Fichier non trouvÃ©: {filepath}")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de dÃ©codage JSON dans {filepath}: {e}")
        return {}


def get_philosopher_quotes(quotes_data: Dict, philosopher_id: int) -> List[Dict]:
    """RÃ©cupÃ¨re les citations d'un philosophe spÃ©cifique"""
    all_quotes = quotes_data.get("quotes", [])
    return [q for q in all_quotes if q["philosopherId"] == philosopher_id]


def calculate_keyword_match(quote: Dict, keywords: List[str]) -> float:
    """Calcule le score de correspondance des mots-clÃ©s"""
    if not keywords:
        return 5.0  # Score neutre par dÃ©faut
    
    quote_keywords = [k.lower() for k in quote.get("keywords", [])]
    request_keywords = [k.lower() for k in keywords]
    
    matches = 0
    for req_kw in request_keywords:
        for quote_kw in quote_keywords:
            if req_kw == quote_kw:
                matches += 2  # Correspondance exacte
            elif req_kw in quote_kw or quote_kw in req_kw:
                matches += 1  # Correspondance partielle
    
    max_possible = len(request_keywords) * 2
    if max_possible == 0:
        return 5.0
    
    score = (matches / max_possible) * 10
    return min(score, 10.0)


def calculate_category_match(quote: Dict, category_name: Optional[str]) -> float:
    """Calcule le score de correspondance de la catÃ©gorie"""
    if not category_name:
        return 5.0  # Score neutre
    
    quote_category = quote.get("categoryName", "").lower()
    request_category = category_name.lower()
    
    if quote_category == request_category:
        return 10.0  # Correspondance parfaite
    
    if request_category in quote_category or quote_category in request_category:
        return 7.0  # Correspondance partielle
    
    return 2.0  # Pas de correspondance


def calculate_context_match(quote: Dict, context: Optional[str]) -> float:
    """Calcule le score de correspondance du contexte"""
    if not context:
        return 5.0  # Score neutre
    
    context_lower = context.lower()
    quote_text = quote.get("quote", "").lower()
    quote_keywords = [k.lower() for k in quote.get("keywords", [])]
    
    context_words = context_lower.split()
    matches = 0
    
    for word in context_words:
        if len(word) < 3:  # Ignorer les mots trÃ¨s courts
            continue
        
        if word in quote_text:
            matches += 1
        
        for kw in quote_keywords:
            if word in kw or kw in word:
                matches += 0.5
    
    if len(context_words) == 0:
        return 5.0
    
    score = (matches / len(context_words)) * 10
    return min(score, 10.0)


def calculate_relevance_score(
    quote: Dict,
    context: Optional[str],
    keywords: List[str],
    category_name: Optional[str],
    philosopher_weights: Optional[Dict[str, float]] = None
) -> float:
    """
    Calcule le score de pertinence global d'une citation
    
    Args:
        quote: La citation Ã  Ã©valuer
        context: Contexte textuel
        keywords: Mots-clÃ©s
        category_name: Nom de la catÃ©gorie
        philosopher_weights: Poids spÃ©cifiques au philosophe pour les catÃ©gories
        
    Returns:
        Score de pertinence de 0 Ã  10
    """
    # Calcul des scores individuels
    keyword_score = calculate_keyword_match(quote, keywords)
    category_score = calculate_category_match(quote, category_name)
    context_score = calculate_context_match(quote, context)
    
    # Poids pour chaque composant
    weights = {
        "keywords": 0.4,
        "category": 0.4,
        "context": 0.2
    }
    
    # Appliquer les poids du philosophe si disponibles
    if philosopher_weights and category_name:
        category_boost = philosopher_weights.get(category_name, 1.0)
        category_score *= category_boost
    
    # Score final pondÃ©rÃ©
    final_score = (
        keyword_score * weights["keywords"] +
        category_score * weights["category"] +
        context_score * weights["context"]
    )
    
    return round(final_score, 2)


def select_best_quote(
    quotes: List[Dict],
    context: Optional[str],
    keywords: List[str],
    category_name: Optional[str],
    philosopher_weights: Optional[Dict[str, float]] = None
) -> Optional[Dict]:
    """
    SÃ©lectionne la meilleure citation parmi une liste
    
    Args:
        quotes: Liste des citations Ã  Ã©valuer
        context: Contexte textuel
        keywords: Mots-clÃ©s
        category_name: Nom de la catÃ©gorie
        philosopher_weights: Poids du philosophe
        
    Returns:
        La citation avec le meilleur score ou None
    """
    if not quotes:
        return None
    
    best_quote = None
    best_score = 0.0
    
    for quote in quotes:
        score = calculate_relevance_score(
            quote, context, keywords, category_name, philosopher_weights
        )
        
        if score > best_score:
            best_score = score
            best_quote = quote.copy()
            best_quote["relevance_score"] = score
    
    return best_quote


def format_request_message(
    context: Optional[str],
    keywords: List[str],
    category_name: Optional[str]
) -> str:
    """Formate un message de requÃªte en JSON"""
    message = {
        "type": "REQUEST",
        "context": context or "",
        "keywords": keywords,
        "category": category_name or ""
    }
    return json.dumps(message)


def format_response_message(
    philosopher_id: int,
    philosopher_name: str,
    quote: Dict,
    score: float,
    vote: str,
    reasoning: str = ""
) -> str:
    """Formate un message de rÃ©ponse en JSON"""
    message = {
        "type": "RESPONSE",
        "philosopher_id": philosopher_id,
        "philosopher_name": philosopher_name,
        "quote": {
            "quoteId": quote.get("quoteId"),
            "text": quote.get("quote"),
            "source": quote.get("source"),
            "category": quote.get("category"),
            "categoryName": quote.get("categoryName")
        },
        "score": score,
        "vote": vote,
        "reasoning": reasoning
    }
    return json.dumps(message)


def parse_message(message_str: str) -> Optional[Dict]:
    """Parse un message JSON"""
    try:
        return json.loads(message_str)
    except json.JSONDecodeError as e:
        logger.error(f"Ã‰chec du parsing du message: {e}")
        return None


def determine_vote(score: float, accept_threshold: float = 5.0) -> str:
    """DÃ©termine le vote basÃ© sur le score"""
    return "Accept" if score >= accept_threshold else "Reject"


def calculate_quorum(accepts: int, total_votes: int) -> float:
    """Calcule le pourcentage de quorum"""
    if total_votes == 0:
        return 0.0
    return accepts / total_votes
