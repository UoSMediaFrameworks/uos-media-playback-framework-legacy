#!/bin/bash

export NODE_ENV=development
export ASSET_STORE=http://localhost:4000
export MEDIA_HUB=http://localhost:3000
export SOUNDCLOUD_CLIENT_ID=someexampleid2980ausoantoaeu
export VIMEO_ACCESS_TOKEN=somexampletokensnaotehuasnoe
export AZURE_CDN_URL=uosassetstore.blob.core.windows.net
export MEDIA_HUB_GRAPH_URL=http://localhost:6000

$@
