import React from 'react'

export default function UserMessage({message , time}) {
  return (

      <div className="d-flex flex-column align-items-end tw-gap-2 max-w-3xl ms-auto w-100">
        <div className="d-flex align-items-end tw-gap-3 flex-row-reverse">
          <div className="bg-user-chat bg-center bg-no-repeat bg-cover rounded-pill size-8 flex-shrink-0 border border-custom align-self-end tw-mb-1"></div>
          <div className="d-flex flex-column align-items-end tw-gap-1">
            <div className="tw-px-5 tw-py-4 bg-primary-custom text-white rounded-2xl rounded-tr-sm shadow-md-custom shadow-primary-10 max-w-580">
              <p className="text-15px fw-medium leading-relaxed mb-0">
                {/* I&apos;ve been feeling a sharp pain in my lower left abdomen since this morning. Should I be worried? */}
              {message}
              </p>
            </div>
            <span className="text-secondary-custom text-xs tw-mr-1">
                {}
                {time}
                </span>
          </div>
        </div>
      </div>
  )
}
