# test_full_system.py
"""
Test complet du système distribué
Teste l'API REST du serveur coordinateur
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"


def print_separator(title=""):
    """Affiche un séparateur visuel"""
    print("\n" + "="*60)
    if title:
        print(f"  {title}")
        print("="*60)
    else:
        print("="*60)


def test_root():
    """Test de l'endpoint racine"""
    print_separator("TEST 1: Root Endpoint")
    
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    
    data = response.json()
    print(f"Message: {data['message']}")
    print(f"Version: {data['version']}")
    print(f"Active Nodes: {data['active_nodes']}")
    
    return response.status_code == 200


def test_status():
    """Test de l'endpoint status"""
    print_separator("TEST 2: Status Endpoint")
    
    response = requests.get(f"{BASE_URL}/status")
    print(f"Status: {response.status_code}")
    
    data = response.json()
    print(f"System Status: {data['system_status']}")
    print(f"Active Nodes: {data['active_nodes']}/{data['total_nodes']}")
    
    print("\nPhilosopher Nodes:")
    for phil in data['philosophers']:
        status_icon = "🟢" if phil['status'] == 'active' else "🔴"
        print(f"  {status_icon} {phil['name']} (port {phil['port']}) - {phil['status']}")
    
    return response.status_code == 200


def test_scan():
    """Test de l'endpoint scan"""
    print_separator("TEST 3: Scan Endpoint")
    
    response = requests.post(f"{BASE_URL}/scan")
    print(f"Status: {response.status_code}")
    
    data = response.json()
    print(f"Active Nodes: {data['active_nodes']}/{data['total_nodes']}")
    
    print("\nAvailability:")
    for name, available in data['availability'].items():
        icon = "✅" if available else "❌"
        print(f"  {icon} {name}")
    
    return response.status_code == 200


def test_recommendation(context, keywords, category):
    """Test de l'endpoint recommend avec un scénario"""
    print_separator(f"TEST 4: Recommendation - {context[:30]}...")
    
    payload = {
        "context": context,
        "keywords": keywords,
        "category": category
    }
    
    print(f"Request:")
    print(f"  Context: {context}")
    print(f"  Keywords: {keywords}")
    print(f"  Category: {category}")
    
    print("\nSending request...")
    start = time.time()
    
    response = requests.post(f"{BASE_URL}/recommend", json=payload)
    
    elapsed = time.time() - start
    print(f"Response time: {elapsed:.3f}s")
    print(f"Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ Error: {response.json()}")
        return False
    
    data = response.json()
    
    # Affichage du consensus
    consensus = data['consensus']
    print(f"\n📊 CONSENSUS:")
    print(f"  Total Votes: {consensus['total_votes']}")
    print(f"  Accepts: {consensus['accepts']}")
    print(f"  Rejects: {consensus['rejects']}")
    print(f"  Quorum: {consensus['quorum_percentage']}% (threshold: {consensus['threshold']}%)")
    print(f"  Quorum Reached: {'✅ YES' if consensus['quorum_reached'] else '❌ NO'}")
    
    # Affichage du gagnant
    winner = data['winner']
    if winner:
        print(f"\n🏆 WINNER:")
        print(f"  Quote ID: {winner['quote_id']}")
        print(f"  Average Score: {winner['average_score']}/10")
        print(f"  Votes: {winner['votes_count']}")
        print(f"\n  \"{winner['quote']['text']}\"")
        print(f"  - Source: {winner['quote']['source']}")
        print(f"\n  Supporters:")
        for supporter in winner['supporters']:
            print(f"    - {supporter['philosopher']}: {supporter['score']}/10")
    else:
        print(f"\n❌ No winner - consensus not reached")
    
    # Affichage détaillé des votes
    print(f"\n📋 DETAILED VOTES:")
    for vote in data['votes_detail']:
        vote_icon = "✅" if vote['vote'] == 'Accept' else "❌"
        print(f"\n  {vote_icon} {vote['philosopher_name']}:")
        print(f"     Vote: {vote['vote']}")
        print(f"     Score: {vote['score']}/10")
        print(f"     Reasoning: {vote['reasoning']}")
    
    print(f"\n⏱️  Processing time: {data['processing_time']}s")
    
    return response.status_code == 200


def test_philosophers():
    """Test de l'endpoint philosophers"""
    print_separator("TEST 5: Philosophers List")
    
    response = requests.get(f"{BASE_URL}/philosophers")
    print(f"Status: {response.status_code}")
    
    data = response.json()
    print(f"\nAvailable Philosophers:")
    for phil in data['philosophers']:
        print(f"\n  {phil['id']}. {phil['name']}")
        print(f"     School: {phil['school']}")
        print(f"     Behavior: {phil['behavior']}")
        print(f"     Port: {phil['port']}")
    
    return response.status_code == 200


def run_all_tests():
    """Lance tous les tests"""
    print("\n" + "="*60)
    print("🧪 FULL SYSTEM TEST SUITE")
    print("="*60)
    print("\nMake sure the following are running:")
    print("  1. Server: python server.py")
    print("  2. Nodes: python node_philosopher.py <1-6>")
    print("\nPress Enter to start tests...")
    input()
    
    results = []
    
    try:
        # Tests basiques
        results.append(("Root", test_root()))
        time.sleep(1)
        
        results.append(("Status", test_status()))
        time.sleep(1)
        
        results.append(("Scan", test_scan()))
        time.sleep(1)
        
        # Tests de recommandation avec différents scénarios
        scenarios = [
            {
                "context": "feeling stressed and anxious at work",
                "keywords": ["stress", "anxiety", "work", "pressure"],
                "category": "Happiness and well-being"
            },
            {
                "context": "need to make a difficult moral decision",
                "keywords": ["morality", "decision", "ethics", "right"],
                "category": "Ethics and behavior"
            },
            {
                "context": "searching for meaning in life",
                "keywords": ["meaning", "purpose", "life", "existence"],
                "category": "Life and human nature"
            }
        ]
        
        for i, scenario in enumerate(scenarios, 1):
            results.append((
                f"Recommendation {i}",
                test_recommendation(**scenario)
            ))
            time.sleep(2)
        
        # Test de la liste des philosophes
        results.append(("Philosophers", test_philosophers()))
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server!")
        print("Make sure the server is running: python server.py")
        return
    
    # Résumé
    print_separator("TEST RESULTS SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        icon = "✅" if result else "❌"
        print(f"{icon} {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests PASSED!")
    else:
        print(f"\n⚠️  {total - passed} test(s) FAILED")
    
    print("="*60)


if __name__ == "__main__":
    run_all_tests()