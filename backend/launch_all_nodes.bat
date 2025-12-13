@echo off
echo ========================================
echo Lancement de tous les Philosophes dans UNE Fenêtre
echo ========================================

REM Activer l'environnement virtuel
if exist "..\venv\Scripts\activate.bat" call ..\venv\Scripts\activate.bat

REM Démarrer tous les nœuds en arrière-plan avec start /B
echo Démarrage des nœuds...
start /B python node_philosopher.py 1
start /B python node_philosopher.py 2
start /B python node_philosopher.py 3
start /B python node_philosopher.py 4
start /B python node_philosopher.py 5
start /B python node_philosopher.py 6

echo.
echo Tous les 6 nœuds démarrés en arrière-plan!
echo Maintenant démarrage du serveur...
echo.

python server.py

pause