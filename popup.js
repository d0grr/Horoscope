'use strict'

/* global chrome */

import * as storage from './js/storage.js'
import * as i18n from './js/localize.js'

let day = 'today'
let find = null
const znaks = 
[ {"name": "aries", "dates": "03-21 - 04-19"}, {"name": "taurus", "dates": "04-20 - 05-20"}, {"name": "gemini", "dates": "05-21 - 06-20"}, {"name": "cancer", "dates": "06-21 - 07-22"}, {"name": "leo", "dates": "07-23 - 08-22"}, {"name": "virgo", "dates": "08-23 - 09-22"}, {"name": "libra", "dates": "09-23 - 10-22"}, {"name": "scorpio", "dates": "10-23 - 11-21"}, {"name": "sagittarius", "dates": "11-22 - 12-21"}, {"name": "capricorn", "dates": "12-22 - 01-19"}, {"name": "aquarius", "dates": "01-20 - 02-18"}, {"name": "pisces", "dates": "02-19 - 03-20"} ]

document.addEventListener('DOMContentLoaded', init)

async function init() {
    try {
        await Promise.all([i18n.localize(), restorePreferences()])
    } catch (error) {
        console.error('An error occurred:', error)
    }
}


async function restorePreferences() {
    const storedPreferences = await storage
        .load('preferences', storage.preferenceDefaults)
        .catch((error) => {
            console.error('An error occurred:', error)
        })

    for (const preferenceName in storedPreferences) {
        const preferenceObj = storedPreferences[preferenceName]
        const preferenceElement = document.getElementById(preferenceName)

        if (preferenceElement) {
            preferenceElement.checked = preferenceObj.status
        }
    }
}

const getStorage = () =>{
    chrome.storage.local.get(["id"]).then((result) => {
        if(result.id){
            fetching(result.id)
        }
    });
}

getStorage()
const popup = () =>{
    const btns = document.querySelectorAll('.btn')
    btns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = btn.id
            fetching(id)

        })
    })
}
const title = document.querySelector('.title')
const wrap = document.querySelector('.wrap')
const article = document.querySelector('.article')
const articleText = document.querySelector('.article__text')
const backBtn = document.querySelector('.back')
const yesterdayBtn = document.querySelector('.yesterday')
const tomorrowBtn = document.querySelector('.tomorrow')
const todayBtn = document.querySelector('.today')
const burger = document.querySelector('.burger')
const menu = document.querySelector('.menu')
const znak = document.querySelector('.znak')
const input = document.querySelector('.input')

const setMaxDate = () =>{
    const b = new Date()
    let m =b.getMonth()+1
    let d =b.getDate()
    let y =b.getFullYear()
    let max = `${y + '-' + (m<10?'0'+m:m) + '-' + (d<10?'0'+d:d)}`
    input.max=max
}
setMaxDate()
const closeMenu = () =>{
    burger.classList.remove('open')
    menu.classList.remove('active')
    wrap.classList.remove('open')
}
document.body.addEventListener('click',()=>{
    closeMenu()
})
burger.addEventListener('click',(e)=>{
    e.stopPropagation()
    burger.classList.toggle('open')
    menu.classList.toggle('active')
    wrap.classList.toggle('open')
})
menu.addEventListener('click',(e)=>{
    e.stopPropagation()
})
znak.addEventListener('click',(e)=>{
    e.stopPropagation()
    
})
input.addEventListener('change',(e)=>{
    const b = new Date(e.target.value)
    let t = b.getTime()
    const y = b.getFullYear()
    let i = 0 
    for (let index = 0; index < znaks.length; index++) {
        const element = znaks[index];
        let elD = element.dates.split(' - ')
        elD = elD.map(el=>{
            const b = new Date(y+'-'+el)
            return b.getTime()
        })

        if(t>=elD[0] && t<=elD[1]){
            i = index
            break
        }
    }

    fetching(znaks[i].name)
})
backBtn.addEventListener('click',()=>{
    title.innerHTML = 'Гороскоп'
    article.classList.remove('active')
    articleText.innerHTML=''
    menu.classList.remove('find')
    chrome.storage.local.clear()
    find = null
    day = 'today'
    dayBtnsFunc()
    closeMenu()

})

const dayBtnClick = (d) =>{
    day = d
    dayBtnsFunc()
    if(find){
        fetching(find)
    }
}
yesterdayBtn.addEventListener('click',()=>{
    dayBtnClick('yesterday')
})
todayBtn.addEventListener('click',()=>{
    dayBtnClick('today')
})
tomorrowBtn.addEventListener('click',()=>{
    dayBtnClick('tomorrow')
})
const dayBtnsFunc = () =>{
    const dayBtn = document.querySelector(`.${day}.menuBtn`)
    const dayBtns = document.querySelectorAll(`.menuBtn`)
    dayBtns.forEach((el)=>{
        el.classList.remove('chose')
    })
    dayBtn.classList.add('chose')
}


const gethtml = (cl,result,id) =>{
    const div = document.createElement('div')
    div.innerHTML = result
    const match = div.querySelector(`.${cl}`)
    const text = match.textContent
    if(text){
        find = id
        menu.classList.add('find')
        article.classList.add('active')
        articleText.innerHTML = match.innerHTML
        const btn = document.querySelector(`#${id}`)
        const img = btn.querySelector('img')
        const imgTitle = img.cloneNode()
        title.textContent = btn.textContent
        title.appendChild(imgTitle)
        div.remove()
    }
    return text
}

const fetchFunc = async(url,id,cl,last) =>{
    let success = false

    try {
        const res = await fetch(url)
        const result = await res.text()
        if(gethtml(cl,result,id)){
            success = true
        }

    } catch (error) {
        console.log(error)
        if(last){
            // alert('Ошибка:( Попробуйте позже')
            article.classList.add('active')
            articleText.innerHTML = '<div class="article__err">Ошибка:( Попробуйте позже</div>'
        }

    }

    return success
}
const fetching = async(id)=>{
    let baseUrl = `https://horoscope.devvision.tech/api/horoscope/${id}/${day}/`
    const planBNames = {
        aries:'oven',
        taurus:'telets',
        gemini:'bliznetsy',
        cancer:'rak',
        leo:'lev',
        virgo:'deva',
        libra:'vesy',
        scorpio:'skorpion',
        sagittarius:'strelets',
        capricorn:'kozerog',
        aquarius:'vodolei',
        pisces:'ryby',
    }
    let planBUrl = `https://horoscope.devvision.tech/horoscope-second/${planBNames[id]}/${day==='tomorrow'?'zavtra/':day==='today'?'':'vchera/'}` 
    document.body.classList.add('loading')
    closeMenu()
    chrome.storage.local.set({ "id": id })
    let success = await fetchFunc(baseUrl,id,'article__item',false)
    
    if(!success){
        await fetchFunc(planBUrl,id,'horoscope-text',true)
    }
    //await fetchFunc(planBUrl,id,'horoscope-text',true)

    document.body.classList.remove('loading')
}

popup()


