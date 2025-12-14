import time
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from collections import deque
import statistics
import functools

logger = logging.getLogger(__name__)


@dataclass
class ProfileResult:
    method: str
    start_time: float
    end_time: float
    duration: float
    active_nodes: int
    successful_responses: int
    failed_responses: int
    node_timings: Dict[int, float]
    context: str
    timestamp: float


class Profiler:
    def __init__(self, max_history: int = 100):
        self.max_history = max_history
        self.results = deque(maxlen=max_history)
        self.sequential_results = deque(maxlen=max_history)
        self.parallel_results = deque(maxlen=max_history)
        logger.info("Profiler initialized")
        
    def record_result(self, result: ProfileResult):
        self.results.append(result)
        
        if result.method == "sequential":
            self.sequential_results.append(result)
            logger.info(f"Recorded sequential result: {result.duration:.3f}s")
        elif result.method == "parallel":
            self.parallel_results.append(result)
            logger.info(f"Recorded parallel result: {result.duration:.3f}s")
    
    def get_statistics(self) -> Dict[str, Any]:
        seq_stats = self._calculate_stats(list(self.sequential_results))
        par_stats = self._calculate_stats(list(self.parallel_results))
        
        comparison = {}
        if seq_stats["count"] > 0 and par_stats["count"] > 0:
            comparison = {
                "speedup": seq_stats["avg_duration"] / par_stats["avg_duration"] if par_stats["avg_duration"] > 0 else 0,
                "improvement_percentage": ((seq_stats["avg_duration"] - par_stats["avg_duration"]) / seq_stats["avg_duration"] * 100) if seq_stats["avg_duration"] > 0 else 0
            }
        else:
            comparison = {
                "speedup": 0,
                "improvement_percentage": 0
            }
        
        return {
            "sequential": seq_stats,
            "parallel": par_stats,
            "comparison": comparison
        }
    
    def _calculate_stats(self, results: List[ProfileResult]) -> Dict[str, Any]:
        if not results:
            return {
                "count": 0,
                "avg_duration": 0,
                "min_duration": 0,
                "max_duration": 0,
                "std_duration": 0,
                "avg_success_rate": 0,
                "total_requests": 0,
                "total_successes": 0
            }
        
        durations = [r.duration for r in results]
        success_rates = [
            (r.successful_responses / r.active_nodes * 100) if r.active_nodes > 0 else 0 
            for r in results
        ]
        
        return {
            "count": len(results),
            "avg_duration": round(statistics.mean(durations), 4),
            "min_duration": round(min(durations), 4),
            "max_duration": round(max(durations), 4),
            "std_duration": round(statistics.stdev(durations), 4) if len(durations) > 1 else 0,
            "avg_success_rate": round(statistics.mean(success_rates), 2),
            "total_requests": sum(r.active_nodes for r in results),
            "total_successes": sum(r.successful_responses for r in results)
        }
    
    def get_chart_data(self) -> Dict[str, Any]:
        seq_list = list(self.sequential_results)
        par_list = list(self.parallel_results)
        
        max_len = max(len(seq_list), len(par_list))
        labels = [f"Test {i+1}" for i in range(max_len)]
        
        seq_durations = [r.duration for r in seq_list]
        par_durations = [r.duration for r in par_list]
        
        seq_success = [
            (r.successful_responses / r.active_nodes * 100) if r.active_nodes > 0 else 0
            for r in seq_list
        ]
        par_success = [
            (r.successful_responses / r.active_nodes * 100) if r.active_nodes > 0 else 0
            for r in par_list
        ]
        
        node_comparison = self._get_node_comparison(seq_list, par_list)
        
        return {
            "labels": labels,
            "sequential_durations": seq_durations,
            "parallel_durations": par_durations,
            "sequential_success": seq_success,
            "parallel_success": par_success,
            "node_comparison": node_comparison
        }
    
    def _get_node_comparison(self, seq_list: List[ProfileResult], par_list: List[ProfileResult]) -> Dict:
        seq_by_nodes = {}
        par_by_nodes = {}
        
        for r in seq_list:
            if r.active_nodes not in seq_by_nodes:
                seq_by_nodes[r.active_nodes] = []
            seq_by_nodes[r.active_nodes].append(r.duration)
        
        for r in par_list:
            if r.active_nodes not in par_by_nodes:
                par_by_nodes[r.active_nodes] = []
            par_by_nodes[r.active_nodes].append(r.duration)
        
        node_counts = sorted(set(list(seq_by_nodes.keys()) + list(par_by_nodes.keys())))
        
        if not node_counts:
            return {
                "labels": [],
                "sequential": [],
                "parallel": []
            }
        
        seq_avg = [
            statistics.mean(seq_by_nodes.get(n, [0])) 
            for n in node_counts
        ]
        par_avg = [
            statistics.mean(par_by_nodes.get(n, [0])) 
            for n in node_counts
        ]
        
        return {
            "labels": [f"{n} nodes" for n in node_counts],
            "sequential": seq_avg,
            "parallel": par_avg
        }
    
    def export_results(self, filepath: str = "profiling_results.json"):
        data = {
            "statistics": self.get_statistics(),
            "chart_data": self.get_chart_data(),
            "raw_results": [
                {
                    **asdict(r),
                    "timestamp": r.timestamp
                }
                for r in self.results
            ]
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Profiling results exported to {filepath}")
        return filepath
    
    def clear_results(self):
        self.results.clear()
        self.sequential_results.clear()
        self.parallel_results.clear()
        logger.info("Profiling results cleared")


profiler = Profiler()


def profile_broadcast(method: str):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self, context, keywords, category_name, *args, **kwargs):
            start_time = time.time()
            
            logger.info(f"[PROFILING] Starting {method} broadcast...")
            
            responses = func(self, context, keywords, category_name, *args, **kwargs)
            
            end_time = time.time()
            duration = end_time - start_time
            
            successful = sum(1 for r in responses.values() if r is not None)
            failed = len(responses) - successful
            
            node_timings = {}
            for phil_id in responses.keys():
                node_timings[phil_id] = 0.0
            
            result = ProfileResult(
                method=method,
                start_time=start_time,
                end_time=end_time,
                duration=duration,
                active_nodes=len(responses),
                successful_responses=successful,
                failed_responses=failed,
                node_timings=node_timings,
                context=context or "",
                timestamp=time.time()
            )
            
            profiler.record_result(result)
            
            logger.info(f"[PROFILING] {method} completed in {duration:.3f}s")
            
            return responses
        
        return wrapper
    return decorator