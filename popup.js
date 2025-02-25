'use strict'

/* global chrome */

import * as storage from './js/storage.js'
import * as i18n from './js/localize.js'

let day = 'today'
let find = null

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
const tomorrowBtn = document.querySelector('.tomorrow')
const todayBtn = document.querySelector('.today')
const burger = document.querySelector('.burger')
const menu = document.querySelector('.menu')

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

backBtn.addEventListener('click',()=>{
    title.innerHTML = chrome.i18n.getMessage('appName')
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
            articleText.innerHTML = '<div class="article__err">'+chrome.i18n.getMessage('error')+'</div>'
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


