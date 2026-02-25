import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
if(!window.storage){window.storage={async get(k){const v=localStorage.getItem('fc_'+k);return v?{key:k,value:v}:null},async set(k,v){localStorage.setItem('fc_'+k,typeof v==='string'?v:JSON.stringify(v));return{key:k,value:v}},async delete(k){localStorage.removeItem('fc_'+k);return{key:k}},async list(p=''){const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('fc_'+p))keys.push(k.replace('fc_',''))}return{keys}}}}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
