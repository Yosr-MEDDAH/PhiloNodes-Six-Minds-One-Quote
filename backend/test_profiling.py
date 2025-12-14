import requests
import time
import json

API_BASE = "http://127.0.0.1:8000"

test_cases = [
    {
        "context": "se sentir stressé au travail",
        "keywords": ["stress", "travail", "pression"],
        "category": "Happiness and well-being"
    },
    {
        "context": "comment vivre une vie vertueuse",
        "keywords": ["vertu", "éthique", "moralité"],
        "category": "Ethics and behavior"
    },
    {
        "context": "trouver la sagesse dans la vie",
        "keywords": ["sagesse", "connaissance", "vérité"],
        "category": "Wisdom"
    },
    {
        "context": "comprendre la liberté humaine",
        "keywords": ["liberté", "choix", "autonomie"],
        "category": "Freedom"
    },
    {
        "context": "chercher le bonheur authentique",
        "keywords": ["bonheur", "joie", "satisfaction"],
        "category": "Happiness and well-being"
    }
]

def run_test(method, test_case, test_num):
    print(f"\n[Test #{test_num}] Method: {method.upper()}")
    print(f"Context: {test_case['context']}")
    
    payload = {
        **test_case,
        "method": method
    }
    
    start = time.time()
    try:
        response = requests.post(f"{API_BASE}/recommend", json=payload)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            print(f"Duration: {elapsed:.3f}s")
            print(f"Server Time: {data['processing_time']:.3f}s")
            print(f"Active Nodes: {data['active_nodes']}")
            print(f"Quorum: {data['consensus']['quorum_reached']}")
            if data['winner']:
                print(f"Winner Quote ID: {data['winner']['quote_id']}")
            return True
        else:
            print(f"Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def get_profiling_stats():
    try:
        response = requests.get(f"{API_BASE}/profiling/data")
        if response.status_code == 200:
            data = response.json()
            return data
    except Exception as e:
        print(f"Error fetching stats: {e}")
    return None

def print_statistics(stats):
    if not stats:
        print("\nNo statistics available")
        return
    
    print("\n" + "="*60)
    print("PROFILING STATISTICS")
    print("="*60)
    
    seq = stats['statistics']['sequential']
    par = stats['statistics']['parallel']
    comp = stats['statistics']['comparison']
    
    print(f"\nSEQUENTIAL:")
    print(f"  Tests: {seq['count']}")
    if seq['count'] > 0:
        print(f"  Avg Duration: {seq['avg_duration']:.4f}s")
        print(f"  Min Duration: {seq['min_duration']:.4f}s")
        print(f"  Max Duration: {seq['max_duration']:.4f}s")
        print(f"  Std Dev: {seq['std_duration']:.4f}s")
        print(f"  Success Rate: {seq['avg_success_rate']:.2f}%")
    else:
        print("  No data recorded")
    
    print(f"\nPARALLEL:")
    print(f"  Tests: {par['count']}")
    if par['count'] > 0:
        print(f"  Avg Duration: {par['avg_duration']:.4f}s")
        print(f"  Min Duration: {par['min_duration']:.4f}s")
        print(f"  Max Duration: {par['max_duration']:.4f}s")
        print(f"  Std Dev: {par['std_duration']:.4f}s")
        print(f"  Success Rate: {par['avg_success_rate']:.2f}%")
    else:
        print("  No data recorded")
    
    print(f"\nCOMPARISON:")
    if comp.get('speedup', 0) > 0:
        print(f"  Speedup: {comp['speedup']:.2f}x")
        print(f"  Improvement: {comp['improvement_percentage']:.2f}%")
    else:
        print("  Not enough data for comparison")

def main():
    print("="*60)
    print("PROFILING TEST SUITE")
    print("="*60)
    print("\nMake sure server and nodes are running!")
    print("This will run 5 tests for each method (10 total)")
    input("\nPress Enter to start...")
    
    test_num = 1
    seq_success = 0
    
    print("\n" + "="*60)
    print("SEQUENTIAL TESTS")
    print("="*60)
    
    for test_case in test_cases:
        if run_test("sequential", test_case, test_num):
            seq_success += 1
        time.sleep(1)
        test_num += 1
    
    print("\n" + "="*60)
    print("PARALLEL TESTS")
    print("="*60)
    
    par_success = 0
    
    for test_case in test_cases:
        if run_test("parallel", test_case, test_num):
            par_success += 1
        time.sleep(1)
        test_num += 1
    
    print("\n" + "="*60)
    print(f"Tests completed: {seq_success}/5 sequential, {par_success}/5 parallel")
    print("Fetching profiling statistics...")
    print("="*60)
    
    time.sleep(2)
    
    stats = get_profiling_stats()
    
    if stats:
        print_statistics(stats)
    else:
        print("\nFailed to fetch profiling statistics from server")
        print("Check that /profiling/data endpoint is available")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)
    print(f"\nOpen profiling_dashboard.html to visualize results")
    print(f"Or visit: http://127.0.0.1:8000/profiling/data")

if __name__ == "__main__":
    main()