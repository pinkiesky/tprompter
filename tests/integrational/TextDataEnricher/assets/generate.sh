#!/bin/bash
# This script creates files based on the specified paths.
# Each file's content is set to its file name.

##############################
# 1. Create files: ./[0-9]f #
##############################
# This loop creates files: 0f, 1f, ..., 9f in the current directory.
for digit in {0..9}; do
    filename="./${digit}f"
    echo "${digit}f" > "$filename"
done

##########################################
# 2. Create files: ./[0-2]d/[0-9]f2      #
##########################################
# For each directory 0d, 1d, and 2d, create files 0f2, 1f2, ..., 9f2.
for d in {0..2}; do
    dir="./${d}d"
    mkdir -p "$dir"  # Ensure the directory exists
    for digit in {0..9}; do
        filename="${dir}/${digit}f2"
        echo "${digit}f2" > "$filename"
    done
done

############################################
# 3. Create file: ./rd/rd/rd/f3            #
############################################
# Create nested directories rd/rd/rd and then create the file f3 inside them.
dir="./rd/rd/rd"
mkdir -p "$dir"  # Create the nested directories
filename="${dir}/f3"
echo "f3" > "$filename"