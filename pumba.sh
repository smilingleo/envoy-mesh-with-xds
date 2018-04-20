#! /bin/bash

_DIR=${PWD##*/}
_DIR=`echo $_DIR | sed -e 's/-//g'`
docker run -it --network $_DIR"_default" --rm -v /var/run/docker.sock:/var/run/docker.sock gaiaadm/pumba sh