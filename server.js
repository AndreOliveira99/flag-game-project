const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const fs = require('fs')

app.use(express.static('.'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// app.get('/teste', (req, res) => res.send(new Date))
app.listen(3003, () => console.log('Executando...'))

app.post('/answers', (req, res) => {
    console.log(req.body)
    let answer = req.body
    fs.readFile('answers-data.json', function (err, data) {
        let json = JSON.parse(data)
        json.push(answer)
        fs.writeFile("answers-data.json", JSON.stringify(json), function (err) {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        })
    })
    res.send('<h1>Parabéns!!! Resposta Registrada!</h1>')
})

// do get request to take data for the flag, and 3 options. 
// Make the game work on frontend using this request
// do post request only to register record list!