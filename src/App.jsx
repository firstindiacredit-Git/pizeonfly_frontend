import './App.css'
import Signup from './pages/Signup'
import EmployeeSinup from './pages/EmployeeSinup'
import Signin from './pages/Signin'
import EmployeeSinin from './pages/EmployeeSinin'
import ClientSignin from './pages/ClientSignin'


import { HashRouter, Routes, Route } from 'react-router-dom'
import ProjectDashboard from './pages/ProjectDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ClientDashboard from './pages/ClientDashboard'
import Member from './pages/Member'
import Project from './pages/Project'
import EmployeeProject from './pages/EmployeeProject'
import ClientProject from './pages/ClientProject';
import Tasks from './pages/Tasks'
import EmployeeTasks from './pages/EmployeeTask'
import Images from './pages/Image'
import Client from './pages/Client'
import Calander from './pages/Calander'
import CreateInvoice from './pages/CreateInvoice'
import AllInvoice from './pages/AllInvoice'
import UpdateInvoice from './pages/UpdateInvoice'

import UrlShortner from './pages/tools/UrlShortner'
import QrCodeGenerate from './pages/tools/QrCodeGenerate'
import SaasManager from './pages/tools/SaasManager'
import Miscellaneous from './pages/tools/Miscellaneous/Miscellaneous'
import HtmlTemplateGenerator from './pages/tools/HtmlTemplateGenerator'
import CardValidator from './pages/tools/CardValidator'
import CardGenerator from './pages/tools/CardGenerator'

import Miscellaneous1 from './pages/tools/Miscellaneous/Miscellaneous1'
import OnlineScreenrecorder from './pages/tools/Miscellaneous/OnlineScreenrecoder'
import OnlineScreenshot from './pages/tools/Miscellaneous/OnlineScreenshot'
import SpeechToText from './pages/tools/Miscellaneous/SpeechToText'
import TextToSpeech from './pages/tools/Miscellaneous/TextToSpeech'
import OnlineVoiceRecorder from './pages/tools/Miscellaneous/OnlineVoiceRecorder'
import OnlineWebcamTest from './pages/tools/Miscellaneous/OnlineWebcamTest'

import EmployeeCardValidator from './pages/employee-tools/CardValidator'
import EmployeeHtmlTemplateGenerator from './pages/employee-tools/HtmlTemplateGenerator'
import EmployeeMiscellaneous from './pages/employee-tools/Miscellaneous'
import EmployeeSaasManager from './pages/employee-tools/SaasManager'
import EmployeeQrCodeGenerate from './pages/employee-tools/QrCodeGenerate'
import EmployeeUrlShortner from './pages/employee-tools/UrlShortner'
import EmployeeCardGenerator from './pages/employee-tools/CardGenerator'

import ClientCardValidator from './pages/clients-tools/CardValidator'
import ClientHtmlTemplateGenerator from './pages/clients-tools/HtmlTemplateGenerator'
import ClientMiscellaneous from './pages/clients-tools/Miscellaneous'
import ClientSaasManager from './pages/clients-tools/SaasManager'
import ClientQrCodeGenerate from './pages/clients-tools/QrCodeGenerate'
import ClientUrlShortner from './pages/clients-tools/UrlShortner'
import ClientCardGenerator from './pages/clients-tools/CardGenerator'

// import Test from './pages/test'


function App() {

  return (
    <HashRouter >
      <Routes >
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/employeesignup' element={<EmployeeSinup />}></Route>
        <Route path='/' element={<Signin />}></Route>
        <Route path='/employeesignin' element={<EmployeeSinin />}></Route>
        <Route path='/clientsignin' element={<ClientSignin />}></Route>

        <Route path='/project-dashboard' element={<ProjectDashboard />}></Route>
        <Route path='/employee-dashboard' element={<EmployeeDashboard />}></Route>
        <Route path='/client-dashboard' element={<ClientDashboard />}></Route>
        <Route path='/members' element={<Member />}></Route>
        <Route path='/projects' element={<Project />}></Route>
        <Route path='/employee-projects' element={<EmployeeProject />}></Route>
        <Route path='/client-projects' element={<ClientProject />}></Route>
        <Route path='/tasks' element={<Tasks />}></Route>
        <Route path='/employee-tasks' element={<EmployeeTasks />}></Route>
        <Route path='/images' element={<Images />}></Route>
        <Route path='/clients' element={<Client />}></Route>
        <Route path='/calander' element={<Calander />}></Route>
        <Route path='/create-invoice' element={<CreateInvoice />}></Route>
        <Route path='/all-invoice' element={<AllInvoice />}></Route>
        <Route path='/update-invoice' element={<UpdateInvoice />}></Route>


        <Route path='/urlShortner' element={<UrlShortner />}></Route>
        <Route path='/qrCodeGenerate' element={<QrCodeGenerate />}></Route>
        <Route path='/saasManager' element={<SaasManager />}></Route>
        <Route path='/miscellaneous' element={<Miscellaneous />}></Route>
        <Route path='/htmlTemplateGenerator' element={<HtmlTemplateGenerator />}></Route>
        <Route path='/cardValidator' element={<CardValidator />}></Route>
        <Route path='/cardGenerator' element={<CardGenerator />}></Route>

        <Route path='/miscellaneous1' element={<Miscellaneous1 />}></Route>
        <Route path='/online-screenrecorder' element={<OnlineScreenrecorder/>}></Route>
        <Route path='/online-screenshot' element={<OnlineScreenshot/>}></Route>
        <Route path='/speech-to-text' element={<SpeechToText/>}></Route>
        <Route path='/text-to-speech' element={<TextToSpeech/>}></Route>
        <Route path='/online-voice-recorder' element={<OnlineVoiceRecorder/>}></Route>
        <Route path='/online-webcam-test' element={<OnlineWebcamTest/>}></Route>

        <Route path='/employee-htmlTemplateGenerator' element={<EmployeeHtmlTemplateGenerator />}></Route>
        <Route path='/employee-cardValidator' element={<EmployeeCardValidator />}></Route>
        <Route path='/employee-miscellaneous' element={<EmployeeMiscellaneous />}></Route>
        <Route path='/employee-saasManager' element={<EmployeeSaasManager />}></Route>
        <Route path='/employee-qrCodeGenerate' element={<EmployeeQrCodeGenerate />}></Route>
        <Route path='/employee-urlShortner' element={<EmployeeUrlShortner />}></Route>
        <Route path='/employee-cardGenerator' element={<EmployeeCardGenerator />}></Route>

        <Route path='/clients-cardValidator' element={<ClientCardValidator />}></Route>
        <Route path='/clients-htmlTemplateGenerator' element={<ClientHtmlTemplateGenerator />}></Route>
        <Route path='/clients-miscellaneous' element={<ClientMiscellaneous />}></Route>
        <Route path='/clients-saasManager' element={<ClientSaasManager />}></Route>
        <Route path='/clients-qrCodeGenerate' element={<ClientQrCodeGenerate />}></Route>
        <Route path='/clients-urlShortner' element={<ClientUrlShortner />}></Route>
        <Route path='/clients-cardGenerator' element={<ClientCardGenerator />}></Route>






      </Routes>
    </HashRouter>
  )
}

export default App
