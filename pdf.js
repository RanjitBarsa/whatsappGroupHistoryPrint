const PDFDocument = require('pdfkit');
const fs = require('fs');
const csv = require('csv-parser')
// const dateformat = require("dateformat");

class GeneratePDF {
    constructor(data) {
        this.doc = new PDFDocument();
        this.writeStream = fs.createWriteStream('whatsapp.pdf');
        this.doc.pipe(this.writeStream);
        this.data = data;
    }

    drawLine(doc, fromx, fromy, tox, toy) {
        doc.lineCap('butt')
            .moveTo(fromx, fromy)
            .lineTo(tox, toy)
            .stroke()
    }

    generate() {
        this.doc.fontSize(14).text("whatsapp messages", 5, 5, { align: "center" })
        this.drawLine(this.doc, 0, 25, 620, 25);
        this.columns = [
            "date",
            "type",
            "from",
            "message",
            "image"
        ];

        let columnLen = this.columns.length;
        this.box = 620 / columnLen;
        this.addColumn(this.doc, 30, this.columns)
        this.drawLine(this.doc, 0, 45, 620, 45);

        //add row
        this.lastRowYaxis = 50;

        for (let row of this.data) {
            if (this.lastRowYaxis >= 700) {
                this.doc.addPage();
                this.lastRowYaxis = 10;
            }
            this.addRow(this.doc, this.lastRowYaxis, row)
            if (!row.image) this.lastRowYaxis += 50;
            else this.lastRowYaxis += 110
        }

        this.doc.end();

    }

    addColumn(doc, yaxis, columns) {

        let no = 0;
        for (let col of columns) {
            doc.fontSize(12).text(col, this.box * no, yaxis);
            no++;
        }
    }

    addRow(doc, yaxis, data) {
        // datetime
        doc.fontSize(8).text(data.datetime, this.box * 0, yaxis);

        // type
        doc.fontSize(8).text(data.type, this.box * 1, yaxis);

        // from 
        doc.fontSize(8).text(data.from, this.box * 2, yaxis);

        // message
        doc.fontSize(8).text(data.message, this.box * 3, yaxis);

        if (data.media)
            // media
            doc.image(data.media, this.box * 4, yaxis,
                { width: 100, height: 100 });
    }

    reset() {

    }
}

// pdf = new GeneratePDF();


let inputFilePath = "./csv/whatsapp.csv";
let results = [];
fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', function (data) {
        try {
            results.push(data);
        }
        catch (err) {
            //error handler
        }
    })
    .on('end', function () {
        const generate = new GeneratePDF(results);
        generate.generate();
    });

