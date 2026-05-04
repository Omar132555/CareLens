import React, { useState } from 'react'

function MessageComposer({addMessage}) {
    let now = new Date()
  let hour = now.getHours() < 10 ? `0${now.getHours()}`:now.getHours();
  let minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}`:now.getMinutes();
  let time = `${hour}:${minutes}`
  let [message,setMessage]=useState("")
  return (
    <div className="tw-p-4 md-px-16 md-pb-8 w-100 max-w-5xl mx-auto bg-gradient-custom">
      <div className="tw-mb-4 d-flex justify-content-center">
        <p className="text-xs text-secondary-custom text-center max-w-lg opacity-80 mb-0">
          <span className="material-symbols-outlined align-bottom text-14px tw-mr-1">info</span>
          AI is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
        </p>
      </div>
      <div className="position-relative group-input">
        <div className="d-flex w-100 align-items-end bg-white border border-custom rounded-3xl tw-p-2 transition-all shadow-lg-custom shadow-black-5 input-wrapper">
          <button className="d-flex align-items-center justify-content-center size-10 rounded-pill text-secondary-custom hover-text-primary hover-bg-secondary transition-colors flex-shrink-0 tw-ml-1 tw-mb-1 border-0 bg-transparent">
            <span className="material-symbols-outlined text-24px">add_circle</span>
          </button>
          <textarea
            className="form-control w-100 bg-transparent border-0 text-charcoal placeholder-text-secondary resize-none tw-py-3 tw-px-3 max-h-32 text-base shadow-none min-h-48"
            placeholder="Describe your symptoms or ask a health question..."
            rows="1"
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
          ></textarea>
          <div className="d-flex align-items-center tw-gap-2 flex-shrink-0 tw-mb-1 tw-mr-1">
            <button className="d-flex align-items-center justify-content-center size-10 rounded-pill text-secondary-custom hover-text-primary hover-bg-secondary transition-colors border-0 bg-transparent">
              <span className="material-symbols-outlined text-24px">mic</span>
            </button>
            <button onClick={(e)=>{
              e.preventDefault()
addMessage(message,time)
setMessage("")
            }} className="d-flex align-items-center justify-content-center tw-h-10 tw-px-4 bg-primary-custom hover-bg-primary-hover text-white rounded-pill transition-all fw-bold text-sm shadow-md-custom shadow-primary-20 border-0">
              <span className="d-none d-sm-inline tw-mr-1">Send</span>
              <span className="material-symbols-outlined text-20px fw-bold">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageComposer
