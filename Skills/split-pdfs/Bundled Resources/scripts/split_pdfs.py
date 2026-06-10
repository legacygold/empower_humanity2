# split_pdfs.py
import os
import re
from PyPDF2 import PdfReader, PdfWriter
import sys
sys.stdout.reconfigure(encoding='utf-8')

def is_already_chunked(filename):
    """Check if a file looks like it's already a chunk (e.g., filename_001-020.pdf)"""
    pattern = r'_\d{3}-\d{3}\.pdf$'
    return re.search(pattern, filename) is not None

def split_pdf(input_pdf, output_dir, chunk_size=20):
    """Split a PDF into chunks of specified page number size"""
    try:
        reader = PdfReader(input_pdf)
        total_pages = len(reader.pages)
        
        if total_pages <= chunk_size:
            print(f"  ⚠️ Skipping (only {total_pages} pages, <= {chunk_size})")
            return 0
        
        # Create output directory if needed
        os.makedirs(output_dir, exist_ok=True)
        
        files_created = 0
        base_name = os.path.splitext(os.path.basename(input_pdf))[0]
        
        for i in range(0, total_pages, chunk_size):
            writer = PdfWriter()
            start_page = i + 1  # 1-indexed for display
            end_page = min(i + chunk_size, total_pages)
            
            for page_num in range(i, end_page):
                writer.add_page(reader.pages[page_num])
            
            # Create filename with zero-padded page numbers
            output_filename = f"{base_name}_{start_page:03d}-{end_page:03d}.pdf"
            output_path = os.path.join(output_dir, output_filename)
            
            with open(output_path, "wb") as output_file:
                writer.write(output_file)
            
            files_created += 1
            print(f"  ✓ Created: {output_filename}")
        
        return files_created
        
    except Exception as e:
        print(f"  ✗ Error: {str(e)[:100]}")
        return 0

def main():
    pdf_dir = r"C:\Users\ortho\.openclaw\workspace\TempFiles"
    
    print("🔍 Scanning for PDF files to chunk...")
    
    # Get all PDF files in the directory
    all_files = os.listdir(pdf_dir)
    pdf_files = [f for f in all_files if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found!")
        return
    
    print(f"Found {len(pdf_files)} PDF file(s)\n")
    
    total_created = 0
    processed = 0
    
    for filename in pdf_files:
        full_path = os.path.join(pdf_dir, filename)
        
        # Skip if already chunked
        if is_already_chunked(filename):
            print(f"⏭️ Skipping (already chunked): {filename}")
            continue
        
        # Create subfolder name (base name of the PDF without extension)
        base_name = os.path.splitext(filename)[0]
        chunk_folder = os.path.join(pdf_dir, base_name)
        
        print(f"📄 Processing: {filename}")
        print(f"   Output folder: {base_name}/")
        
        # Check if chunk folder already exists with files
        if os.path.exists(chunk_folder):
            existing_chunks = [f for f in os.listdir(chunk_folder) 
                             if f.endswith('.pdf') and base_name in f]
            if existing_chunks:
                print(f"   ⚠️ Chunk folder exists with {len(existing_chunks)} files - skipping")
                continue
        
        # Split the PDF
        created = split_pdf(full_path, chunk_folder)
        total_created += created
        processed += 1
        
        print(f"   Total chunks created: {created}\n")
    
    print("="*60)
    print(f"✅ Summary:")
    print(f"   Processed {processed} file(s)")
    print(f"   Created {total_created} chunk file(s)")
    print(f"   Chunks stored in subfolders named after source PDFs")

if __name__ == "__main__":
    main()
