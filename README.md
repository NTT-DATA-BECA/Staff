# Generate Documents azcs_PFE 2023

`Electron` + `Vue` + `Vite` + `sqlite3` .

# Code Explanation
# _______________________________________________________
The line :  
script: 
path.join(__dirname, 'node_modules/html-pdf-phantomjs-included/lib/scripts/pdf_a4_portrait.js').replace('app.asar', 'app.asar.unpacked').replace('\dist','') _*exist*_ in Generate.vue and Editor.vue.

# During Development:
Comment the Line: Disable the line of code.
Reason: Ensures your app works correctly during development when file paths may vary.

# During Production Build:
Uncomment the Line: Enable the line of code.
Reason: These changes are crucial for the production build to ensure proper file references.
# ________________________________________________________