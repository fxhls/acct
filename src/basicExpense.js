const fs = require('fs')
const utils = require('./utils.js')

var isNumber = function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
 }


const processjournalEntriesSchema = (journalEntriesSchema) => {
    var journalEntriesOutput = {
        tchartMap : new Map(),
        journalEntries : []
    }
    console.log('starting...')
    journalEntriesOutput.journalEntries = createJournalEntryShells(journalEntriesSchema, journalEntriesOutput.tchartMap)

    const sortedJournalEntriesOutput = journalEntriesOutput.journalEntries.sort(function (a, b) {
        if (a.dateVal > b.dateVal) return 1;
        if (a.dateVal < b.dateVal) return -1;
        return 0
      }
    )

    let balanceMap = new Map()
    let tchartMap = new Map()

    for(v=0; v<sortedJournalEntriesOutput.length;v++){
        var filledJournalEntries = fillJournalEntryShells(sortedJournalEntriesOutput[v],journalEntriesSchema.constants, balanceMap, tchartMap)
        sortedJournalEntriesOutput[v] = filledJournalEntries.filledEntries
        tchartMap = filledJournalEntries.tchartMap
    }

    journalEntriesOutput.journalEntries = sortedJournalEntriesOutput
    journalEntriesOutput.tchartMap = Object.fromEntries(tchartMap)
    fs.writeFileSync('journalEntries.json', JSON.stringify(journalEntriesOutput))
    
    return journalEntriesOutput
}

const createJournalEntryShells = (journalEntriesSchema, tchartMap) => {
    createdJournalEntryShells = []
    for(iii = 0; iii < journalEntriesSchema.journalEntries.length; iii++)
    {
        createdJournalEntryShell = expandJournalEntries(journalEntriesSchema.journalEntries[iii], 
                                            journalEntriesSchema.constants, 
                                            tchartMap)   

        createdJournalEntryShells = createdJournalEntryShells.concat( 
            createdJournalEntryShell
        )
    }
    return createdJournalEntryShells
}

const expandJournalEntries = (journalEntrySchema, constants, accountMap) =>{
    const expandedJournalEntries = []
    const startDate = new Date(journalEntrySchema.startDate)
    const months = 12 / journalEntrySchema.frequency
    const time = (journalEntrySchema.endDate.getFullYear()- journalEntrySchema.startDate.getFullYear());

    for(ii = 0; ii < journalEntrySchema.frequency *time ; ii++){
        const expandedJournalEntry = createJournalEntryShell(journalEntrySchema, startDate.valueOf(), constants, accountMap)
        expandedJournalEntries.push(
            expandedJournalEntry
        )
        startdate = startDate.setMonth(startDate.getMonth()+months)    
    } 
    return expandedJournalEntries
}



const createJournalEntryShell = (journalEntrySchema, startDate, constants, accountMap) => {
    let r = Math.random().toString(36).substring(7);
    const populateJournalEntry =
        {
            jeid: r,
            description:journalEntrySchema.description,
            date: (new Date(startDate)).toDateString(),
            dateVal: (new Date(startDate)),                    
            debitOverflow: journalEntrySchema.debitOverflow,
            accounts: generateAccounts(journalEntrySchema, r, constants, accountMap)
        }
    return populateJournalEntry
}


const generateAccounts = (journalEntrySchema, r, constants, accountMap)=>{
    var array = []
    for(i = 0; i < journalEntrySchema.accounts.length; i++){
        populatedAccount = populateAccounts(journalEntrySchema.accounts[i], r, constants)
        array.push(
            populatedAccount
        )
    }
    return array
}

const populateAccounts = (account, jeid, constants) => {
    const accountEntrySchema = {
        jeid,
        name: account.name,
        style: account.style,
        debit: account.debit,
        credit: account.credit
    }
    return accountEntrySchema
}

const fillJournalEntryShells =(journalEntryShell, constants, balanceMap, tchartMap) =>{
    var debitAmount = 0.0
    var creditAmount = 0.0
    const jeInfo = {
        date : journalEntryShell.date,
        dateVal : journalEntryShell.dateVal,
        description : journalEntryShell.description    
    }
    for(iv=0; iv<journalEntryShell.accounts.length;iv++){
        journalEntryShell.accounts[iv] = assignDebitCredit(journalEntryShell.accounts[iv], constants, balanceMap);
        
        debitAmount += journalEntryShell.accounts[iv].debit===undefined ? 0 : journalEntryShell.accounts[iv].debit
        creditAmount += journalEntryShell.accounts[iv].credit===undefined ? 0 : journalEntryShell.accounts[iv].credit

        if(journalEntryShell.accounts[iv].debit !== undefined ){
            processAccount(balanceMap,journalEntryShell.accounts[iv],journalEntryShell.accounts[iv].debit,tchartMap,jeInfo)
        }
        else if(journalEntryShell.accounts[iv].credit !== undefined ){
            processAccount(balanceMap,journalEntryShell.accounts[iv],-journalEntryShell.accounts[iv].credit,tchartMap,jeInfo)
        }
    }

    balanceValue = creditAmount - debitAmount 
    if(balanceValue > 0){
        journalEntryShell.accounts[journalEntryShell.debitOverflow].debit = balanceValue
        processAccount(balanceMap,journalEntryShell.accounts[journalEntryShell.debitOverflow],
            journalEntryShell.accounts[journalEntryShell.debitOverflow].debit,tchartMap,jeInfo)
    }
    else if(balanceValue < 0){
        journalEntryShell.accounts[journalEntryShell.debitOverflow].credit = -balanceValue
        processAccount(balanceMap,journalEntryShell.accounts[journalEntryShell.debitOverflow],
            journalEntryShell.accounts[journalEntryShell.debitOverflow].debit,tchartMap,jeInfo)
    }
    return {
        filledEntries:journalEntryShell,
        tchartMap:tchartMap
    }
    
}

const processAccount = (balanceMap,account,value,tchartMap,jeInfo) => {
    populateAccountMap(balanceMap,account.name,value)
    account.accountBalance = balanceMap.get(account.name)
    createTchart(tchartMap, account, jeInfo)
}

const createTchart = (tchartMap, account,jeInfo) => {
        const testAccount = Object.assign({}, account);
        testAccount.date = jeInfo.date
        testAccount.dateVal = jeInfo.dateVal
        testAccount.description = jeInfo.description
        testAccount.balanceType = account.accountBalance <0?'CR':'DR' 
        testAccount.accountBalance = Math.abs(account.accountBalance)
        
        if (!tchartMap.has(testAccount.name)) {
            tchartMap.set(testAccount.name, [testAccount]);
        } 
        else{
            tchartMap.get(testAccount.name).push(testAccount);
        }
    return tchartMap
}

const assignDebitCredit=(account, constants, balanceMap)=>{
    account.debit = processValue(account.debit, constants, balanceMap, account.name),
    account.credit = processValue(account.credit, constants, balanceMap, account.name)

    return account
}

const processValue = (value, constants, balanceMap, accountName) => {
    if(isNumber(value)||value===undefined){
        return value
    }
    else{        
    
        let accountMap = new Map()
        accountMap.set('INT',.045)
        accountMap.set('PMT',1138.96)
        accountMap.set('X',1)
        let mergedMap = new Map(function*() { yield* accountMap; yield* balanceMap; }());
        var calcValue = Math.abs(mergedMap.get(value[0]))*Math.abs(mergedMap.get(value[1]))
        calcValue = utils.round(calcValue)
        return Number.parseFloat(calcValue)
    }
}

const populateAccountMap = (balanceMap, name,value) => {
    
    if (!balanceMap.has(name)) {
        balanceMap.set(name, value);
    } 
    else{
        const existing = balanceMap.get(name) + value
        balanceMap.set(name,existing);
        
    }
}

module.exports = { processjournalEntriesSchema:processjournalEntriesSchema}