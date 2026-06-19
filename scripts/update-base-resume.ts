import { BASE_RESUME_ID, baseResumePayload } from '../lib/db/base-resume-data'
import { closeDb, getDb } from '../lib/db/client'
import { updateResume } from '../lib/db/mutations'

getDb()

updateResume(BASE_RESUME_ID, baseResumePayload)
closeDb()

console.log('Currículo base atualizado:', BASE_RESUME_ID)
