import React, { useState } from 'react'
import UserMessage from './UserMessage'

function ChatMessages({allMessages}) {

  let now = new Date()
  let hour = now.getHours() < 10 ? `0${now.getHours()}`:now.getHours();
  let minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}`:now.getMinutes();
  console.log(`${hour}:${minutes}`)
  return (
    <div className="flex-grow-1 overflow-y-auto tw-p-4 md-p-8 space-y-8 scroll-smooth" id="chat-container">
      <div className="d-flex justify-content-center">
        <span className="text-secondary-custom text-xs fw-medium bg-secondary-custom tw-px-3 tw-py-1 rounded-pill">Today, 10:23 AM</span>
      </div>
      
      <UserMessage message="Hello i am Gado 
 " time={`${hour}:${minutes}`}/>
{/* 
      <div className="d-flex flex-column align-items-end tw-gap-2 max-w-3xl ms-auto w-100">
        <div className="d-flex align-items-end tw-gap-3 flex-row-reverse">
          <div className="bg-user-chat bg-center bg-no-repeat bg-cover rounded-pill size-8 flex-shrink-0 border border-custom align-self-end tw-mb-1"></div>
          <div className="d-flex flex-column align-items-end tw-gap-1">
            <div className="tw-px-5 tw-py-4 bg-primary-custom text-white rounded-2xl rounded-tr-sm shadow-md-custom shadow-primary-10 max-w-580">
              <p className="text-15px fw-medium leading-relaxed mb-0">
                I&apos;ve been feeling a sharp pain in my lower left abdomen since this morning. Should I be worried?
              </p>
            </div>
            <span className="text-secondary-custom text-xs tw-mr-1">10:24 AM</span>
          </div>
        </div>
      </div> */}

      <div className="d-flex flex-column align-items-start tw-gap-2 max-w-3xl me-auto w-100">
        <div className="d-flex align-items-end tw-gap-3">
          <div className="bg-ai-chat bg-center bg-no-repeat bg-cover rounded-pill size-8 flex-shrink-0 border border-custom align-self-end tw-mb-1"></div>
          <div className="d-flex flex-column align-items-start tw-gap-1">
            <div className="tw-px-5 tw-py-4 bg-ai-bubble text-charcoal rounded-2xl rounded-tl-sm border border-custom-50 max-w-640">
              <p className="text-15px leading-relaxed mb-0">
                I understand your concern. Lower left abdominal pain can be associated with several conditions, ranging from minor digestive issues to diverticulitis.
              </p>
              <div className="tw-mt-4 tw-p-4 bg-white rounded-xl border-start-2 border-primary-custom shadow-sm-custom">
                <p className="text-sm fw-medium text-charcoal tw-mb-2 d-flex align-items-center tw-gap-2 mb-0">
                  <span className="material-symbols-outlined text-primary-custom text-18px">vital_signs</span>
                  Symptom Check
                </p>
                <p className="text-sm text-charcoal-80 mb-0">
                  Are you experiencing any <strong>fever</strong>, <strong>nausea</strong>, or changes in bowel habits alongside this pain?
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center tw-gap-2 tw-ml-1">
              <span className="text-secondary-custom text-xs">10:24 AM</span>
              <div className="d-flex tw-gap-1">
                <button className="text-secondary-custom hover-text-primary tw-p-05 border-0 bg-transparent">
                  <span className="material-symbols-outlined text-14px">thumb_up</span>
                </button>
                <button className="text-secondary-custom hover-text-primary tw-p-05 border-0 bg-transparent">
                  <span className="material-symbols-outlined text-14px">thumb_down</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
            {allMessages.map((mess)=> <UserMessage message={mess.mess} time={mess.time}/>)}
      <div className="tw-h-4"></div>
    </div>
  )
}

export default ChatMessages
