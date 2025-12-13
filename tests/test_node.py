import socket
import json
import time

HOST = "127.0.0.1"

def test_node(port: int, philosopher_name: str):
    """
    Teste la communication avec un node philosophe
    
    Args:
        port: Port du node à tester
        philosopher_name: Nom du philosophe (pour affichage)
    """
    print(f"\n{'='*60}")
    print(f"Testing {philosopher_name} on port {port}")
    print(f"{'='*60}\n")
    
    try:
        print(f"1. Connecting to {HOST}:{port}...")
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.settimeout(5.0)
        client.connect((HOST, port))
        print(" Connected successfully\n")
        
        request = {
            "type": "REQUEST",
            "context": "feeling stressed and anxious",
            "keywords": ["stress", "anxiety", "pressure", "deadline"],
            "category": "Happiness and well-being"
        }
        
        print(f"2. Sending request:")
        print(f"   Context: '{request['context']}'")
        print(f"   Keywords: {request['keywords']}")
        print(f"   Category: '{request['category']}'")
        
        message = json.dumps(request)
        client.sendall(message.encode('utf-8'))
        print(" Request sent\n")
        
        print("3. Waiting for response...")
        response_data = client.recv(4096).decode('utf-8')
        
        if not response_data:
            print(" No response received")
            return
        
        response = json.loads(response_data)
        print(" Response received\n")
        
        print(f"{'='*60}")
        print("RESPONSE DETAILS:")
        print(f"{'='*60}")
        print(f"Philosopher: {response['philosopher_name']}")
        print(f"Vote: {response['vote']}")
        print(f"Score: {response['score']}/10")
        print(f"Reasoning: {response['reasoning']}")
        print()
        print("Quote:")
        quote = response['quote']
        print(f"  \"{quote['text']}\"")
        print(f"  - {response['philosopher_name']}")
        print(f"  Source: {quote['source']}")
        print(f"  Category: {quote['categoryName']}")
        print(f"{'='*60}\n")
        
        client.close()
        print(" Test completed successfully")
        
    except ConnectionRefusedError:
        print(f" Connection refused. Is the node running on port {port}?")
        print(f"   Start it with: python node_philosopher.py <id>")
    except socket.timeout:
        print(" Timeout waiting for response")
    except json.JSONDecodeError as e:
        print(f" Invalid JSON response: {e}")
    except Exception as e:
        print(f" Error: {e}")


def test_heartbeat(port: int, philosopher_name: str):
    print(f"\n{'='*60}")
    print(f"Testing HEARTBEAT for {philosopher_name} on port {port}")
    print(f"{'='*60}\n")
    
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.settimeout(3.0)
        client.connect((HOST, port))
        
        heartbeat = {"type": "HEARTBEAT"}
        client.sendall(json.dumps(heartbeat).encode('utf-8'))
        
        response = client.recv(1024).decode('utf-8')
        data = json.loads(response)
        
        print(f" Heartbeat response:")
        print(f"   Status: {data.get('status')}")
        print(f"   Philosopher: {data.get('philosopher')}")
        
        client.close()
        
    except Exception as e:
        print(f" Heartbeat failed: {e}")


def run_all_tests():
    """Lance une série de tests sur différents nodes"""
    
    nodes_to_test = [
        (5002, "Immanuel Kant"),
        (5005, "Leo Tolstoy"),
        (5001, "Aristotle"),
    ]
    
    print("\n" + "="*60)
    print("STARTING NODE TESTS")
    print("="*60)
    print("\nMake sure to start the nodes first:")
    print("  python node_philosopher.py 2  # Kant")
    print("  python node_philosopher.py 5  # Tolstoy")
    print("  python node_philosopher.py 1  # Aristotle")
    print("\nPress Enter to continue...")
    input()
    
    for port, name in nodes_to_test:
        test_node(port, name)
        time.sleep(1)
        test_heartbeat(port, name)
        time.sleep(1)



if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        philosopher_id = int(sys.argv[1])
        
        nodes = {
            1: (5001, "Aristotle"),
            2: (5002, "Immanuel Kant"),
            3: (5003, "Friedrich Nietzsche"),
            4: (5004, "Fyodor Dostoevsky"),
            5: (5005, "Leo Tolstoy"),
            6: (5006, "Confucius")
        }
        
        if philosopher_id in nodes:
            port, name = nodes[philosopher_id]
            test_node(port, name)
            test_heartbeat(port, name)
        else:
            print(f"Invalid philosopher ID: {philosopher_id}")
            print("Valid IDs: 1-6")
    else:
        run_all_tests()