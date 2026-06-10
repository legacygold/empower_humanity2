import zipfile, os
os.chdir('C:\\Users\\ortho\\.openclaw\\workspace')
files = ['Unification_Theory.md']
with zipfile.ZipFile('Unification_Theory_Package.zip', 'w') as z:
    for f in files:
        if os.path.exists(f):
            z.write(f)
            print('Added', f)
print('Zip created')