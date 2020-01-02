const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('express-flash');
const expressValidator = require('express-validator');

const dbcon = require('./lib/mysql/connection.js')

const app = express();
const port = '3005';

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: '12332rf',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))

app.use(flash());

//app.use(expressValidator());

app.set ('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.get('/',(req, res) => {
    let dataLomba = [];
    dbcon.query('SELECT * FROM lomba', (err, data)=>{
        dataLomba = data
    })

    dbcon.query ('SELECT k.*, d.lomba as lomba from peserta k INNER JOIN lomba d ON k.lomba = d.id', (err, data)=>{
        
        res.render('index', {dataPeserta: data, dataLomba});
    })
    
})


app.post('/create',(req, res) => {
    const {nama, kelas, lomba} = req.body;

    dbcon.query('INSERT INTO peserta SET ?', {nama, kelas, lomba}, (err)=>{
        if(err) throw err;
        res.redirect('/');
    });
})

app.post('/add',(req, res) => {
    let dataLomba = [];
    dbcon.query('SELECT * FROM lomba', (err, data)=>{
        dataLomba = data
    })

    dbcon.query ('SELECT k.*, d.lomba as lomba from peserta k INNER JOIN lomba d ON k.lomba = d.id', (err, data)=>{
        
        res.render('add', {dataPeserta: data, dataLomba});
    })
})

app.get('/update/(:No)',(req, res, next) => {
    
    dbcon.query('SELECT * FROM peserta WHERE No =' + req.params.No, (err, rows, fields)=>{
        if(err) throw err
        let dataLomba = [];
        dbcon.query('SELECT * FROM lomba', (err, data)=>{
            dataLomba = data
        })   
        
        if (rows.length<=0){
    
            req.flash('error', 'Peserta tidak ditemukan')
            req.redirect('back')
        } else {
            dbcon.query ('SELECT k.*, d.lomba as lomba from peserta k INNER JOIN lomba d ON k.lomba = d.id', (err, data)=>{
            res.render('update.ejs', {
                nama: rows[0].Nama,
                kelas: rows[0].Kelas,
                id: rows[0].Lomba, dataPeserta: data, dataLomba
            })
        })
        }
    })
})

app.post('/update/:id',(req, res) => {

    const {nama, kelas, lomba} = req.body;
    const user = {No : req.params.No}

    dbcon.query('UPDATE peserta SET ? WHERE No = ' + req.params.No, {nama, kelas, lomba}, user, (err, result)=>{
        if(err) throw err;
        res.redirect('/');
    });
        
    })

app.get('/delete/(:No)',(req, res) => {
    const user = {No : req.params.No}
    dbcon.query('DELETE FROM peserta where No = ' +req.params.No, user, (err, result)=>{
        if(err) throw err;
        res.redirect('back');
        
    })
})

app.listen(port, ()=>{
    console.log('listening on port ' + port);
})