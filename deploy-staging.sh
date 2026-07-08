#!/usr/bin/env bash
set -euo pipefail

# Deploys the CURRENT WORKING TREE to staging (web-brew-buddy-staging).
#
# This is the sanctioned deploy path for AI coding agents: images are tagged
# :staging (prod runs :latest with pullPolicy Never — the tag is the isolation),
# and the rollout uses a namespace-scoped kubeconfig (kimchi-deployer SA), so
# the sanctioned path provably cannot touch prod. Prod deploys stay in deploy.sh.

NS=web-brew-buddy-staging
KUBECONFIG_FILE="${KIMCHI_KUBECONFIG:-$HOME/.kube/kimchi-staging.yaml}"

echo "Building staging images..."
sudo docker build --network=host -t brew-muse:staging .
sudo docker build --network=host -f Dockerfile.server -t brew-muse-api:staging .

echo "Loading into k3s..."
sudo docker save brew-muse:staging | sudo k3s ctr images import -
sudo docker save brew-muse-api:staging | sudo k3s ctr images import -

echo "Restarting staging deployments (scoped kubeconfig)..."
export KUBECONFIG="$KUBECONFIG_FILE"
kubectl rollout restart deployment/brew-buddy-staging-brew-muse -n "$NS"
kubectl rollout restart deployment/brew-buddy-staging-brew-muse-api -n "$NS"

echo "Watching rollout..."
kubectl rollout status deployment/brew-buddy-staging-brew-muse -n "$NS" --timeout=180s
kubectl rollout status deployment/brew-buddy-staging-brew-muse-api -n "$NS" --timeout=180s

echo "Done — staging: https://brew-buddy-staging.hippotion.com"
