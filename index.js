const fs = require("fs");
const path = require("path");
const mdpdf = require('mdpdf');


// Define the function to scan a directory for PHP files and extract substrings between balanced braces
async function scanDirectory(dir) {
    // Read the directory contents
    const files = fs.readdirSync(dir);

    let contents = ''
    // Iterate over each file in the directory
    for (const file of files) {
        // Construct the absolute path to the file
        const filePath = path.join(dir, file);

        // If the file is a directory, recursively scan it for PHP files
        if (fs.statSync(filePath).isDirectory()) {
            contents = await scanDirectory(filePath);
        }

        // read the file 
        const data = fs.readFileSync(filePath, 'utf8');
        contents += '\n\n## ' + data

    }
    return contents
}

// Get the directory path from the command line arguments
const dir = process.argv[2];

(async () => {
    // Scan the dir
    const result = await scanDirectory(dir);

    // generate a random number
    const randomNumber = Math.floor(Math.random() * 1000000000) + 1;

    // write the result to a /tmp file with the random number
    const tmpFile = '/tmp/' + randomNumber + '.md'
    fs.writeFileSync(tmpFile, result);


    let options = {
        source: tmpFile,
        destination: path.join(__dirname, 'output.pdf'),
        //styles: path.join(__dirname, 'md-styles.css'),
        pdf: {
            format: 'A4',
            orientation: 'portrait'
        }
    };

    mdpdf.convert(options).then((pdfPath) => {
        console.log('PDF Path:', pdfPath);
    }).catch((err) => {
        console.error(err);
    });
    // console.log(result)
})()