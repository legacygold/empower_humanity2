---
name: convert-excel-json
description: This skill enables the agent to convert between Excel (.xlsx) and JSON (.json) file formats, facilitating data manipulation and integration with various tools and workflows.
---

# convert-excel-json Overview

This skill provides the agent with the ability to convert Excel files (.xlsx) into JSON format and vice versa. This is particularly useful for users who need to work with data in different formats for analysis, reporting, or integration with other applications. The skill includes scripts that utilize libraries such as `pandas` to perform the conversions efficiently while ensuring data integrity. The agent can invoke this skill when a user requests to convert a file or when it detects a need for format conversion during a workflow.

---

## When to use this skill

If a user uploads an Excel file (.xlsx) and requests to convert it to JSON format, the agent should invoke this skill to perform the conversion and provide the user with the resulting JSON file. Conversely, if a user uploads a JSON file and requests to convert it to Excel format, the agent should use this skill to generate an Excel file from the JSON data and return it to the user. This skill can be used in various contexts, such as data analysis, reporting, or when integrating with tools that require specific file formats.

---

#### Bundled Resources

These are the resources included with the convert-excel-json skill to facilitate its functionality:

##### Scripts (`scripts/`)

Use `convert_excel_json.py` located at `Skills/convert-excel-json/Bundled Resources/scripts/convert_excel_json.py` to perform the conversions between Excel and JSON formats. This script takes an input file (either .xlsx or .json) and converts it to the desired format while ensuring that the data structure is preserved. The script should handle various edge cases, such as nested data in JSON or multiple sheets in Excel, and provide clear error messages if the conversion fails. The resulting file should be saved in a temporary directory and sent to the user in the empower_testbot isolated session chat before being deleted from the temporary directory to maintain workspace cleanliness.


##### References (`references/`)

None at this time.


##### Assets (`assets/`)

None at this time.



