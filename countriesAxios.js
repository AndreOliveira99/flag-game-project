const optionPool = 3
const flagPool = 10
const answerButton = document.getElementById('answer-button')

let optionsArray = []
let answerCounter = 0
let countryArray = undefined
let answersArray = []
let rightAnswersArray = []
let imgUrlArray = []
let answersCounter = 0
let emptyOptions = 0
let score = 0

const config = {
    url: "https://flagcdn.com/en/codes.json",
    method: "get"
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomCountry(countriesJson) {
    let randomCountryIndex = getRandomIntInclusive(0, countriesJson.length)
    return countriesJson[randomCountryIndex]
}

/* The api used for the flags had not only countrues flags but also
 * US States included, so this function makes sure that the selected
 * item is a country, not a state
 */
function verifyCountry(currentCountry) {
    let currentCountryCode = currentCountry[0]
    while ((currentCountryCode.split('-')[0] == 'us')
        && currentCountryCode.split('-')[1]) {
        currentCountry = getRandomCountry(countryArray)
        currentCountryCode = currentCountry[0]
    }
    return currentCountry
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

function selectFlag(countryArray) {

    let currentCountry = getRandomCountry(countryArray)
    currentCountry = verifyCountry(currentCountry)
    console.log(currentCountry)
    let currentCountryCode = currentCountry[0]

    const flag = document.querySelector('[flag]')
    let imgURL = `https://flagcdn.com/256x192/${currentCountryCode}.png`

    imgUrlArray[answersCounter] = imgURL

    flag.setAttribute('src', imgURL)

    displayOptions(currentCountry, countryArray)
}

async function displayOptions(currentCountry, countryArray) {
    optionsArray = []
    let currentCountryName = currentCountry[1]
    rightAnswersArray[answersCounter] = currentCountryName
    optionsArray.push(currentCountryName)
    for (let i = 0; i < (optionPool - 1); i++) {
        let fakeOption = await getRandomCountry(countryArray)
        fakeOption = verifyCountry(fakeOption)
        optionsArray.push(fakeOption[1])
    }
    shuffleArray(optionsArray)
    document.querySelectorAll('[country-option]').forEach((e, index) => {
        e.setAttribute('value', optionsArray[index])
        e.nextElementSibling.innerHTML = optionsArray[index]
    })
}

function callNextFlag() {
    selectFlag(countryArray)
}

function verifySelectedOption() {
    emptyOptions = 0
    document.querySelectorAll('[country-option]').forEach(e => {
        if (e.checked) {
            answersArray[answersCounter] = e.value
            answersCounter++
            e.checked = false
            return
        }
        else {
            emptyOptions++
        }
    })
}

function resetVariables() {
    console.log('reset variables')
    optionsArray = []
    answerCounter = 0
    answersArray = []
    rightAnswersArray = []
    imgUrlArray = []
    answersCounter = 0
    score = 0
}

function startNewGame() {
    console.log('start new game')
    removePopup()
    resetVariables()
    callNextFlag()
}

function gameOver() {
    console.log('game over')
    //document.getElementById("popup-1").classList.add("active")
    createReport()
    document.getElementById("popup-2").classList.add("active")
}

function removePopup() {
    //document.getElementById("popup-1").classList.remove("active")
    document.getElementById("popup-2").classList.remove("active")
}

// to do: coment what this function does in more details!!
function callNextStep() {
    if (answersCounter < flagPool && (emptyOptions !== optionPool)) {
        callNextFlag()
    }
    else if (answersCounter < flagPool && (emptyOptions === optionPool)) {
        // displayAlert() // write this function
        console.log('selecione uma opção!!!')
    }
    else {
        console.log('maior')
        gameOver() // write this function
    }
}

answerButton.addEventListener('click', e => {
    verifySelectedOption()
    callNextStep()
})

document.querySelectorAll('[newGame]').forEach(e => e.addEventListener('click', startNewGame))


/* This function runs only on page load. It's purpose is to get the list  
 * of countries from a database
 */
axios(config)
    .then(response => countryArray = Object.entries(response.data))
    .then(countryArray => selectFlag(countryArray))
    .catch(e => {
        const msg = document.createTextNode(e)
        document.querySelector('.flag-wrapper').appendChild(msg)
    })

// Report Code:

function createNewElement(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function ReportLine(flagImgURL, selectedOptionString, rightOptionString) {
    this.element = createNewElement('div', 'report-line')

    const flagImg = createNewElement('img', 'report-flag-img')
    const selectedOption = createNewElement('span', 'selected-option')
    const rightOption = createNewElement('span', 'right-option')

    flagImg.setAttribute('src', flagImgURL)
    selectedOption.innerHTML = selectedOptionString
    rightOption.innerHTML = rightOptionString

    if (selectedOptionString === rightOptionString) {
        const classString = selectedOption.className + ' ' + 'right-answer'
        selectedOption.className = classString
        score++
    }
    else {
        const classString = selectedOption.className + ' ' + 'wrong-answer'
        selectedOption.className = classString
    }

    this.element.appendChild(flagImg)
    this.element.appendChild(selectedOption)
    this.element.appendChild(rightOption)
}

function ReportHeader(headerRow1, headerRow2, headerRow3) {
    this.element = createNewElement('div', 'report-line')

    const flagImgHeader = createNewElement('span', 'report-table-header')
    const selectedOptionHeader = createNewElement('span', 'report-table-header')
    const rightOptionHeader = createNewElement('span', 'report-table-header')

    flagImgHeader.innerHTML = headerRow1
    selectedOptionHeader.innerHTML = headerRow2
    rightOptionHeader.innerHTML = headerRow3

    this.element.appendChild(flagImgHeader)
    this.element.appendChild(selectedOptionHeader)
    this.element.appendChild(rightOptionHeader)
}

function updateScore() {
    document.querySelector('[score]').innerHTML = `Score: ${score}`
}

function createReport() {
    const report = document.querySelector('[report]')

    report.innerHTML = ''

    const reportHeader = new ReportHeader('Flag', 'Your Answer', 'Right Answer')
    report.appendChild(reportHeader.element)

    for (let i = 0; i < flagPool; i++) {
        // more than 80 columns ahead.
        const line = new ReportLine(imgUrlArray[i], answersArray[i], rightAnswersArray[i])
        report.appendChild(line.element)
    }

    updateScore()
}