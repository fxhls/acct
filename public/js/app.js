console.log('client loaded')

const weatherForm = document.querySelector('form')
const searchElement = document.querySelector('input')
const error = document.querySelector('#error')
const success = document.querySelector('#success')

weatherForm.addEventListener('submit',(e) => {
    e.preventDefault()
    const location = searchElement.value
    fetch('http://localhost:3000/weather?search='+location).then((response) => {
    response.json().then((data)=>{
        console.log(data)
        error.textContent = data.error
        success.textContent = data.forecast
    }
    )

})
})