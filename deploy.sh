#!/usr/bin/env bash
set -e

echo "Building images..."
sudo docker build -t brew-muse:latest .
sudo docker build -f Dockerfile.server -t brew-muse-api:latest .

echo "Loading into k3s..."
sudo docker save brew-muse:latest | sudo k3s ctr images import -
sudo docker save brew-muse-api:latest | sudo k3s ctr images import -

echo "Restarting deployments..."
sudo kubectl rollout restart deployment/brew-buddy-brew-muse -n web-brew-buddy
sudo kubectl rollout restart deployment/brew-buddy-brew-muse-api -n web-brew-buddy

echo "Watching rollout..."
sudo kubectl rollout status deployment/brew-buddy-brew-muse -n web-brew-buddy
sudo kubectl rollout status deployment/brew-buddy-brew-muse-api -n web-brew-buddy

echo "Done."
