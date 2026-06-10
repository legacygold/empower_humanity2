#!/usr/bin/env python3
import json
import sys

def clean_json_template(input_path, output_path):
    """
    Clean the JSON template by:
    - Keeping only header rows (row 1)
    - Keeping only column dimensions for visible columns
    - Keeping only row dimensions for header row (row 1)
    - Removing all blank rows beyond header
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned_data = {
        "metadata": data["metadata"],
        "sheets": {}
    }
    
    # Check if sheets exist in data
    if "sheets" not in data:
        print(f"Error: 'sheets' key not found in input file. Available keys: {list(data.keys())}")
        sys.exit(1)
        
    for sheet_name, sheet_data in data["sheets"].items():
        cleaned_sheet = {
            "sheet_name": sheet_data["sheet_name"],
            "dimensions": {
                "max_row": 1,  # Only header row
                "max_column": sheet_data["dimensions"]["max_column"]
            },
            "header_rows": sheet_data["header_rows"],
            "data_start_row": 2,
            "formatting_rules": {},
            "column_dimensions": {},
            "row_dimensions": {},
            "merged_cells": sheet_data.get("merged_cells", [])
        }
        
        # Keep only visible columns (non-hidden)
        for col, dim in sheet_data.get("column_dimensions", {}).items():
            if not dim.get("hidden", False):
                cleaned_sheet["column_dimensions"][col] = dim
        
        # Keep only row 1 dimensions
        if "row_dimensions" in sheet_data and "1" in sheet_data["row_dimensions"]:
            cleaned_sheet["row_dimensions"]["1"] = sheet_data["row_dimensions"]["1"]
        
        cleaned_data["sheets"][sheet_name] = cleaned_sheet
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
    
    print(f"Cleaned template generated at: {output_path}")
    print(f"Original size: {len(json.dumps(data))} bytes")
    print(f"Cleaned size: {len(json.dumps(cleaned_data))} bytes")
    print(f"Reduction: {(1 - len(json.dumps(cleaned_data))/len(json.dumps(data)))*100:.1f}%")

if __name__ == "__main__":
    input_file = r"C:\Users\ortho\.openclaw\workspace\PortalX LITE\Settings\PortalX_LITE_template_clean.json"
    output_file = r"C:\Users\ortho\.openclaw\workspace\PortalX LITE\Settings\PortalX_LITE_template_clean_optimized.json"
    clean_json_template(input_file, output_file)