#!/bin/bash

# Host Metadata - OS
#
export HOST_OS_KERNEL="$(uname -r)"
export HOST_OS_TYPE="$(uname)"

# Host Metadata - General
#
export HOST_ARCH="$(uname -m)"
export HOST_HOSTNAME="$(hostname -s)"
export HOST_ID="$(hostname -f)"
export HOST_NAME="${HOST_HOSTNAME}"
export HOST_DOMAIN="$(echo ${HOST_HOSTNAME#[[:alpha:]]*.})"

connection=$(podman machine --log-level=debug ssh -- exit 2>&1 | grep Executing | sed -E 's/.*ssh \[(.*)\].*/\1/')
sshHost=$(echo "$connection" | sed -E 's/.* (.+@localhost) .*/\1/')
sshPort=$(echo "$connection" | sed -E 's/.*-p ([0-9]+) .*/\1/')
sshIdent=$(echo "$connection" | sed -E 's/.*-i ([^[:space:]]+) .*/\1/')
echo "sshHost  = $sshHost"
echo "sshPort  = $sshPort"
echo "sshIdent = $sshIdent"

podman machine ssh rm -r /tmp/workspace
podman machine ssh mkdir -p /tmp/workspace

scp -q -r -i $sshIdent -P $sshPort -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $PWD/output/* $sshHost:/tmp/workspace/

# Run in foreground, passing vars
#
podman run --rm \
	-v "/tmp/workspace:/config" \
	-e FLUENT_VERSION=1.8.13 \
	-e FLUENT_LABEL_ENV=undefined \
  -e FLUENT_CONF_HOME=/config \
	-e HOST_* \
	--network=host \
	--security-opt label=disable \
	fluent/fluent-bit /fluent-bit/bin/fluent-bit -c /config/fluent-bit.conf

