#!/usr/bin/env python3
import json

def optimize_template():
    input_path = r'C:\Users\ortho\.openclaw\workspace\PortalX LITE\Settings\PortalX_LITE_template_clean.json'
    output_path = r'C:\Users\ortho\.openclaw\workspace\PortalX LITE\Settings\PortalX_LITE_template_optimized.json'
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cleaned = {
        "metadata": {
            "source_file": data["metadata"]["source_file"],
            "generated_at": data["metadata"]["generated_at"],
            "description": data["metadata"]["description"]
        },
        "sheets": {}
    }
    
    # Process each sheet from metadata.sheets
    for sheet_name, sheet in data["metadata"]["sheets"].items():
        # Keep ALL column dimensions (both visible and hidden) - preserve full sheet structure
        all_columns = sheet.get("column_dimensions", {})
        
        # Keep only row 1 (header row) dimensions - remove all blank data row definitions
        row_dims = sheet.get("row_dimensions", {})
        header_row_dims = {}
        if "1" in row_dims:
            header_row_dims["1"] = row_dims["1"]
        
        # Build cleaned sheet
        cleaned_sheet = {
            "sheet_name": sheet["sheet_name"],
            "dimensions": {
                "max_row": 1,  # Only header row exists in template
                "max_column": sheet["dimensions"]["max_column"]
            },
            "header_rows": sheet["header_rows"],
            "data_start_row": 2,
            "formatting_rules": sheet.get("formatting_rules", {}),
            "column_dimensions": all_columns,  # Keep ALL columns (including hidden ones)
            "row_dimensions": header_row_dims,  # Only header row
            "merged_cells": sheet.get("merged_cells", [])
        }
        
        cleaned["sheets"][sheet_name] = cleaned_sheet
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
    
    print(f"Optimized template generated at: {output_path}")
    print(f"Original size: {len(json.dumps(data)):,} bytes")
    print(f"Optimized size: {len(json.dumps(cleaned)):,} bytes")
    reduction = (1 - len(json.dumps(cleaned))/len(json.dumps(data)))*100
    print(f"Reduction: {reduction:.1f}%")

if __name__ == "__main__":
    optimize_template()
