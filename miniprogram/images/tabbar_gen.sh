#!/bin/bash -ex

cd "$(dirname "$0")"

COLOR_DFT="7a7e83"
COLOR_HL="1aad19"

gen_img() {
    local CHAR="$1"
    local COLOR="$2"
    local NAME="$3"

    convert -size 81x81 xc:transparent \
            -font PragmataPro-Liga-Regular \
            -pointsize 72 \
            -fill "#$COLOR" \
            -annotate +5+64 "$CHAR" \
            "tabbar/$NAME.png"
}

gen_img  "$COLOR_DFT" main
gen_img  "$COLOR_HL" main_hl

gen_img  "$COLOR_DFT" rsvp
gen_img  "$COLOR_HL" rsvp_hl

gen_img  "$COLOR_DFT" hunt
gen_img  "$COLOR_HL" hunt_hl

gen_img  "$COLOR_DFT" misc
gen_img  "$COLOR_HL" misc_hl

