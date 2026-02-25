# Load Testing avec Grafana K6

Ce répertoire contient les scénarios de test de charge structurés pour Collector. 
Ces tests sont utilisés pour valider les SLI/SLO de performances, spécifiquement l'indicateur qualité **Disponibilité (ISO 25010)**.

## Pré-requis
Avoir Docker installé (k6 s'exécute depuis une image Docker officielle). 
Si vous lancez les tests contre Minikube, n'oubliez pas d'exécuter `minikube tunnel` pour exposer les services sur `localhost`.

## Lancer les tests

Depuis la racine du projet, utilisez les scripts npm :

- `npm run test:k6:load` : Test de charge nominal. Rampe à 20 utilisateurs concurrents pour vérifier la stabilité de la latence (P95 < 500ms). Idéal pour validations CI.
- `npm run test:k6:stress` : Test de stress. Pousse le système à 100 utilisateurs pour observer le comportement du HPA (Horizontal Pod Autoscaler).
- `npm run test:k6:spike` : Test de pic soudain. Passe de 10 à 200 utilisateurs virtuels en 30 secondes.

Alternativement, vous pouvez exécuter le wrapper :
```bash
./scripts/test/load/run-k6.sh load-test
./scripts/test/load/run-k6.sh stress-test
./scripts/test/load/run-k6.sh spike-test
```

## Structure
- `load-test.js` : Test de base (20 VU, 2 mins)
- `stress-test.js` : Test aux limites (Jusqu'à 100 VU)
- `spike-test.js` : Pic brutal d'utilisateurs (200 VU sur très courte durée)
- `run-k6.sh` : Wrapper bash lançant le conteneur `grafana/k6`
