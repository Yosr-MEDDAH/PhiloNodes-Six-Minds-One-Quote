const API_BASE = 'http://127.0.0.1:8000';
        
        let durationChart, successChart, nodeChart, distributionChart;

        function initCharts() {
            const commonOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Georgia', serif",
                                size: 12
                            },
                            color: '#5d4a3a'
                        }
                    }
                }
            };

            const ctxDuration = document.getElementById('durationChart').getContext('2d');
            durationChart = new Chart(ctxDuration, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Séquentiel',
                            data: [],
                            borderColor: '#d4a574',
                            backgroundColor: 'rgba(212, 165, 116, 0.1)',
                            tension: 0.4,
                            borderWidth: 2
                        },
                        {
                            label: 'Parallèle',
                            data: [],
                            borderColor: '#a8916d',
                            backgroundColor: 'rgba(168, 145, 109, 0.1)',
                            tension: 0.4,
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Durée (secondes)',
                                font: {
                                    family: "'Georgia', serif",
                                    size: 12
                                },
                                color: '#5d4a3a'
                            },
                            ticks: {
                                color: '#8b7355'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#8b7355'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.1)'
                            }
                        }
                    }
                }
            });

            const ctxSuccess = document.getElementById('successChart').getContext('2d');
            successChart = new Chart(ctxSuccess, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Taux de Réussite Séquentiel',
                            data: [],
                            backgroundColor: 'rgba(212, 165, 116, 0.7)',
                            borderColor: '#d4a574',
                            borderWidth: 1
                        },
                        {
                            label: 'Taux de Réussite Parallèle',
                            data: [],
                            backgroundColor: 'rgba(168, 145, 109, 0.7)',
                            borderColor: '#a8916d',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Taux de Réussite (%)',
                                font: {
                                    family: "'Georgia', serif",
                                    size: 12
                                },
                                color: '#5d4a3a'
                            },
                            ticks: {
                                color: '#8b7355'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#8b7355'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.1)'
                            }
                        }
                    }
                }
            });

            const ctxNode = document.getElementById('nodeChart').getContext('2d');
            nodeChart = new Chart(ctxNode, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Séquentiel',
                            data: [],
                            backgroundColor: 'rgba(212, 165, 116, 0.7)',
                            borderColor: '#d4a574',
                            borderWidth: 1
                        },
                        {
                            label: 'Parallèle',
                            data: [],
                            backgroundColor: 'rgba(168, 145, 109, 0.7)',
                            borderColor: '#a8916d',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Durée Moyenne (secondes)',
                                font: {
                                    family: "'Georgia', serif",
                                    size: 12
                                },
                                color: '#5d4a3a'
                            },
                            ticks: {
                                color: '#8b7355'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#8b7355'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.1)'
                            }
                        }
                    }
                }
            });

            const ctxDistribution = document.getElementById('distributionChart').getContext('2d');
            distributionChart = new Chart(ctxDistribution, {
                type: 'radar',
                data: {
                    labels: ['Durée Moy.', 'Durée Min.', 'Durée Max.', 'Taux Réussite', 'Cohérence'],
                    datasets: [
                        {
                            label: 'Séquentiel',
                            data: [0, 0, 0, 0, 0],
                            borderColor: '#d4a574',
                            backgroundColor: 'rgba(212, 165, 116, 0.2)',
                            borderWidth: 2
                        },
                        {
                            label: 'Parallèle',
                            data: [0, 0, 0, 0, 0],
                            borderColor: '#a8916d',
                            backgroundColor: 'rgba(168, 145, 109, 0.2)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 10,
                            ticks: {
                                color: '#8b7355',
                                backdropColor: 'transparent'
                            },
                            grid: {
                                color: 'rgba(139, 115, 85, 0.2)'
                            },
                            pointLabels: {
                                color: '#5d4a3a',
                                font: {
                                    family: "'Georgia', serif",
                                    size: 11
                                }
                            }
                        }
                    }
                }
            });
        }

        async function refreshData() {
            try {
                updateStatus('Chargement...', false);
                
                const response = await fetch(`${API_BASE}/profiling/data`);
                const data = await response.json();
                
                updateStats(data.statistics);
                updateCharts(data.chart_data, data.statistics);
                
                updateStatus('Données actualisées', false);
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
                updateStatus('Erreur de chargement', true);
            }
        }

        function updateStats(stats) {
            document.getElementById('seqAvg').textContent = 
                stats.sequential.avg_duration.toFixed(3) + 's';
            document.getElementById('parAvg').textContent = 
                stats.parallel.avg_duration.toFixed(3) + 's';
            document.getElementById('speedup').textContent = 
                stats.comparison.speedup.toFixed(2) + 'x';
            document.getElementById('improvement').textContent = 
                stats.comparison.improvement_percentage.toFixed(1) + '%';
        }

        function updateCharts(chartData, stats) {
            durationChart.data.labels = chartData.labels;
            durationChart.data.datasets[0].data = chartData.sequential_durations;
            durationChart.data.datasets[1].data = chartData.parallel_durations;
            durationChart.update();

            successChart.data.labels = chartData.labels;
            successChart.data.datasets[0].data = chartData.sequential_success;
            successChart.data.datasets[1].data = chartData.parallel_success;
            successChart.update();

            nodeChart.data.labels = chartData.node_comparison.labels;
            nodeChart.data.datasets[0].data = chartData.node_comparison.sequential;
            nodeChart.data.datasets[1].data = chartData.node_comparison.parallel;
            nodeChart.update();

            const seqStats = stats.sequential;
            const parStats = stats.parallel;
            
            distributionChart.data.datasets[0].data = [
                seqStats.avg_duration,
                seqStats.min_duration,
                seqStats.max_duration,
                seqStats.avg_success_rate / 10,
                10 - (seqStats.std_duration || 0)
            ];
            
            distributionChart.data.datasets[1].data = [
                parStats.avg_duration,
                parStats.min_duration,
                parStats.max_duration,
                parStats.avg_success_rate / 10,
                10 - (parStats.std_duration || 0)
            ];
            
            distributionChart.update();
        }

        async function exportData() {
            try {
                updateStatus('Exportation...', false);
                const response = await fetch(`${API_BASE}/profiling/export`, {
                    method: 'POST'
                });
                const result = await response.json();
                updateStatus('Exporté vers ' + result.filepath, false);
            } catch (error) {
                console.error('Erreur d\'exportation:', error);
                updateStatus('Échec de l\'exportation', true);
            }
        }

        async function clearData() {
            if (!confirm('Effacer tout l\'historique de profilage ?')) return;
            
            try {
                updateStatus('Effacement...', false);
                await fetch(`${API_BASE}/profiling/clear`, {
                    method: 'DELETE'
                });
                await refreshData();
                updateStatus('Historique effacé', false);
            } catch (error) {
                console.error('Erreur d\'effacement:', error);
                updateStatus('Échec de l\'effacement', true);
            }
        }

        function updateStatus(message, isError) {
            const status = document.getElementById('status');
            const statusText = status.querySelector('span:last-child');
            statusText.textContent = message;
            status.className = 'status' + (isError ? ' error' : '');
        }

        initCharts();
        refreshData();
        setInterval(refreshData, 5000);