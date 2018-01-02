#! /bin/bash

_DIR=${PWD##*/}

docker run -it --network $_DIR"_default" --rm -v /var/run/docker.sock:/var/run/docker.sock gaiaadm/pumba sh