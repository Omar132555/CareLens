// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";

// export default function DoctorSetupWizard({
//   categories,
//   form,
//   handleChange,
//   onSubmit,
// }) {
//   const [step, setStep] = useState(1);

//   const next = () => setStep((s) => s + 1);
//   const back = () => setStep((s) => s - 1);

//   const variants = {
//     initial: { opacity: 0, x: 50 },
//     animate: { opacity: 1, x: 0 },
//     exit: { opacity: 0, x: -50 },
//   };
//   useEffect(() => {
//     const getCategories = async () => {
//         axios.get('/api/doctor/categories/get')
//     }
//     },[])
//   return (
//     <div className="wizard-page">
//       <div className="wizard-card">

//         {/* Progress */}
//         <div className="progress">
//           <div
//             className="progress-bar"
//             style={{ width: `${(step / 3) * 100}%` }}
//           />
//         </div>

//         <AnimatePresence mode="wait">

//           {/* STEP 1 */}
//           {step === 1 && (
//             <motion.div
//               key="step1"
//               variants={variants}
//               initial="initial"
//               animate="animate"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="step"
//             >
//               <h2>Welcome Doctor 👨‍⚕️</h2>
//               <p>Let’s build your professional profile.</p>

//               <button className="btn" onClick={next}>
//                 Get Started
//               </button>
//             </motion.div>
//           )}

//           {/* STEP 2 */}
//           {step === 2 && (
//             <motion.div
//               key="step2"
//               variants={variants}
//               initial="initial"
//               animate="animate"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="step"
//             >
//               <h2>Select Specialization</h2>

//               <select
//                 name="category_id"
//                 value={form.category_id}
//                 onChange={handleChange}
//                 className="select"
//               >
//                 <option value="">Choose specialization</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>

//               <div className="buttons">
//                 <button className="btn-secondary" onClick={back}>
//                   Back
//                 </button>

//                 <button
//                   className="btn"
//                   onClick={next}
//                   disabled={!form.category_id}
//                 >
//                   Next
//                 </button>
//               </div>
//             </motion.div>
//           )}

//           {/* STEP 3 */}
//           {step === 3 && (
//             <motion.div
//               key="step3"
//               variants={variants}
//               initial="initial"
//               animate="animate"
//               exit="exit"
//               transition={{ duration: 0.3 }}
//               className="step"
//             >
//               <h2>You're Ready 🎉</h2>
//               <p>Finish setup and start using your dashboard.</p>

//               <div className="buttons">
//                 <button className="btn-secondary" onClick={back}>
//                   Back
//                 </button>

//                 <button className="btn" onClick={onSubmit}>
//                   Finish
//                 </button>
//               </div>
//             </motion.div>
//           )}

//         </AnimatePresence>

//       </div>
//     </div>
//   );
// }