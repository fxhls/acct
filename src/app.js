const path = require('path')
const express = require('express')
const hbs = require('hbs')

const basicExpense = require('./basicExpense.js')
const geocode = require('./utils/geocode.js')
const forecast = require('./utils/forecast.js')

//initialize app
const app = express()
const port = process.env.PORT || 3000

const schema = {
    journalEntries:[
       {
            description:'got loan',
            startDate: new Date('2020-01-02'),
            endDate: new Date('2021-01-02'),
            frequency: 1,
            type: 'static',
            value: 30000,
            accounts: 
            [
                {
                    name: 'Cash',
                    style: 'debit',
                    debit: 5000,
                    credit: undefined
                  },
                {
                  name: 'Notes / Payable',
                  style: 'credit',
                  debit: undefined,
                  credit: 5000
                }
            ]
        },
        {
            description:'loan payment',
            startDate: new Date('2020-12-31'),
            endDate: new Date('2025-12-31'),
            frequency: 1,
            type: 'variable',
            value: 5000,
            debitOverflow: 0,
            accounts: 
            [
                {
                    name: 'Notes / Payable',
                    style: 'debit',
                    debit: undefined,
                    credit: undefined
                },
                {
                    name: 'Interest Exp.',
                    style: 'debit',
                    debit: ['INT','Notes / Payable'],
                    credit: undefined 
                },
                
                {
                    name: 'Cash',
                    style: 'credit',
                    debit: undefined,
                    credit: ['PMT','X']
                }
            ]
        }
        ,{
        description:'monthly office and maint expenses',
        startDate: new Date('2020-01-02'),
        endDate: new Date('2022-01-02'),
        frequency: 2,
        type: 'static',
        value: 3000,
        accounts: 
        [
            {
                name: 'Supplies Exp.',
                style: 'debit',
                debit: 3000,
                credit: undefined
              },{
                name: 'fuel Exp.',
                style: 'debit',
                debit: 2000,
                credit: undefined
              },
            {
              name: 'Cash',
              style: 'credit',
              debit: undefined,
              credit: 5000
            }
        ]
    },
{
    description:'receive cash',
    startDate: new Date('2020-01-02'),
    endDate: new Date('2022-01-02'),
    frequency: 4,
    type: 'static',
    value: 4000,
    accounts: 
    [
        {
            name: 'Cash',
            style: 'debit',
            debit: 4000,
            credit: undefined
          },
        {
          name: 'Revenue',
          style: 'credit',
          debit: undefined,
          credit: 4000
        }
    ]
}
]}


//Define Paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//Setup handlebars engine and views location
app.set('view engine','hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)//register partials

//Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('',(req,res)=>{
    res.render('index',
    {
        title:'Home',
        name:'Sam'
    })}
)

app.get('/about',(req,res)=>{
    res.render('about',
    {
        title:'about',
        name:'Sam'
    })}
)

app.get('/help',(req,res)=>{
    res.render('help',
    {
        title:'help',
        name:'Sam',
        journalEntries: 
            basicExpense.processjournalEntriesSchema(schema).journalEntries,
        tcharts: 
            basicExpense.processjournalEntriesSchema(schema).tchartMap                
    })}
)



app.get('/weather',
    (req,res)=>{
        if(!req.query.search){
        return res.send('weather is no helping you')}
    
        geocode(req.query.search, (error, {longitude, latitude, placeName} = {}) => {
            if (error) {
                return res.send({ error })
            }
    
            forecast(latitude, longitude, (error, forecastData) => {
                if (error) {
                    return res.send({ error })
                }
    
                res.send({
                    forecast: forecastData,
                    placeName,
                    address: req.query.search
                })
            })
        })
    
    }
)

app.get('/help/*',(req,res)=>{    
    res.render('404',
    {
            title:'help',
            name:'Sam',
            message:'help page not found'
        })}) 

app.get('/*',(req,res)=>{
    res.render('404',
    {
        title:'help',
        name:'Sam',
        message:'page not found'
    })}) 
 
//How to start the server
//devport: 3000, http: port:80

app.listen(port,()=>{'server is up on port '+port})