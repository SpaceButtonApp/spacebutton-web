'use client'

import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

// Complete Nigerian location data - State → LGA → Communities
const nigerianLocations: Record<string, Record<string, string[]>> = {
  'Abia': {
    'Aba North': ['Ariaria', 'Eziukwu', 'Igbuoma', 'Okpuala', 'Ekezie', 'Ntigha', 'Abayi'],
    'Aba South': ['Muri', 'Ogbor Hill', 'Ulele', 'Arochukwu Road', 'Obingwa', 'Ukazi'],
    'Arochukwu': ['Arochukwu', 'Ohafia', 'Ozu Abam', 'Uturu', 'Achara', 'Imiringi'],
    'Bende': ['Bende', 'Okigwe', 'Ezinna', 'Ameka', 'Ihechiowa', 'Umunze'],
    'Ikwuano': ['Ikwuano', 'Ibeku', 'Okpuala', 'Umuahia South', 'Ihenta', 'Amawu'],
    'Isuikwuato': ['Isuikwuato', 'Umunneochi', 'Abam', 'Asaga', 'Lokpanta', 'Uzuakoli'],
    'Obi Ngwa': ['Obi Ngwa', 'Itumbauzo', 'Obinagu', 'Osisioma', 'Atafom', 'Aba'],
    'Ohafia': ['Ohafia', 'Arochukwu', 'Afo Uno', 'Osuagwu', 'Nkporo', 'Elu'],
    'Osisioma': ['Osisioma', 'Owerrinta', 'Apata', 'Umuahia', 'Abuodu', 'Iheanacho'],
    'Ugwunagbo': ['Ugwunagbo', 'Ezeoke', 'Ibom', 'Umungonwa', 'Umuahia', 'Isiuzo'],
    'Ukwa East': ['Ukwa', 'Igbere', 'Arochukwu', 'Isiala Ngwa', 'Mma', 'Nrigkwo'],
    'Ukwa West': ['Ukwa', 'Mma', 'Igbere', 'Ubom', 'Nkporo', 'Oloko'],
    'Umuahia North': ['Umuahia', 'Ibeku', 'Olokoro', 'Afaraukwu', 'Amawu', 'Ediene'],
    'Umuahia South': ['Ubakala', 'Itumbauzo', 'Ahiaba', 'Amawu', 'Nkalu', 'Izu'],
    'Umu Nneochi': ['Umu Nneochi', 'Isuikwuato', 'Uturu', 'Abiakpo', 'Asaga', 'Lokpanta'],
  },
  'Adamawa': {
    'Demsa': ['Demsa', 'Gire', 'Gombi', 'Sorau', 'Shelleng'],
    'Fufore': ['Fufore', 'Djingliya', 'Maina', 'Girei', 'Ribadu'],
    'Ganye': ['Ganye', 'Toungo', 'Jada', 'Bambur', 'Song'],
    'Girei': ['Girei', 'Yola South', 'Modibbo', 'Lamido', 'Maiduguri'],
    'Gombi': ['Gombi', 'Demsa', 'Gire', 'Shelleng', 'Yola'],
    'Guyuk': ['Guyuk', 'Jada', 'Mayo-Belwa', 'Ganye', 'Song'],
    'Hong': ['Hong', 'Demsa', 'Fufore', 'Gire', 'Gombi'],
    'Jada': ['Jada', 'Guyuk', 'Toungo', 'Ganye', 'Song'],
    'Lamurde': ['Lamurde', 'Demsa', 'Mubi North', 'Shelleng', 'Gire'],
    'Madagali': ['Madagali', 'Michika', 'Mubi South', 'Shuwa', 'Kimanawa'],
    'Maiha': ['Maiha', 'Michika', 'Mubi North', 'Maiduguri', 'Kimanawa'],
    'Mayo-Belwa': ['Mayo-Belwa', 'Guyuk', 'Jada', 'Toungo', 'Song'],
    'Michika': ['Michika', 'Madagali', 'Mubi South', 'Maroua', 'Shuwa'],
    'Mubi North': ['Mubi', 'Maiha', 'Lamurde', 'Michika', 'Kimanawa'],
    'Mubi South': ['Mubi', 'Madagali', 'Michika', 'Shuwa', 'Maroua'],
    'Numan': ['Numan', 'Demsa', 'Lamurde', 'Shelleng', 'Gire'],
    'Shelleng': ['Shelleng', 'Fufore', 'Demsa', 'Hong', 'Gombi'],
    'Song': ['Song', 'Guyuk', 'Ganye', 'Toungo', 'Mayo-Belwa'],
    'Toungo': ['Toungo', 'Jada', 'Ganye', 'Guyuk', 'Song'],
    'Yola North': ['Yola', 'Jimeta', 'Girei', 'Modibbo', 'Lamido'],
    'Yola South': ['Yola', 'Modibbo', 'Girei', 'Lamido', 'Sabon Gida'],
  },
  'Akwa Ibom': {
    'Abak': ['Abak', 'Uyo', 'Itu', 'Ukam', 'Afaha Ikot'],
    'Eastern Obolo': ['Oron', 'Obolo', 'Akassa', 'Iko', 'Ayadim'],
    'Eket': ['Eket', 'Ibeno', 'Ibesikpo', 'Eyop', 'Nwaniba'],
    'Esit Eket': ['Esit Eket', 'Eket', 'Ibeno', 'Eyop', 'Nwaniba'],
    'Essien Udim': ['Essien Udim', 'Ikot Ekpene', 'Abak', 'Ikot Ibiok', 'Afaha Ikot'],
    'Etim Ekpo': ['Etim Ekpo', 'Ibiono', 'Itu', 'Ukam', 'Ibiaku Utit'],
    'Etinan': ['Etinan', 'Itu', 'Eket', 'Ukam', 'Nwaniba'],
    'Ibeno': ['Ibeno', 'Eket', 'Oron', 'Eyop', 'Nwaniba'],
    'Ibesikpo': ['Ibesikpo', 'Eket', 'Ibeno', 'Eyop', 'Ndok Eto'],
    'Ibiono Ibom': ['Ibiono', 'Etim Ekpo', 'Ini', 'Ukam', 'Ibiaku Utit'],
    'Iko': ['Iko', 'Oron', 'Eastern Obolo', 'Iyat', 'Ayadim'],
    'Ikot Abasi': ['Ikot Abasi', 'Oron', 'Eket', 'Iyat', 'Ayadim'],
    'Ikot Ekpene': ['Ikot Ekpene', 'Abak', 'Essien Udim', 'Ikot Ibiok', 'Afaha Ikot'],
    'Ini': ['Ini', 'Ibiono', 'Etim Ekpo', 'Ukam', 'Ibiaku Utit'],
    'Itu': ['Itu', 'Etinan', 'Abak', 'Ukam', 'Ibiaku Utit'],
    'Mbo': ['Mbo', 'Oron', 'Iko', 'Iyat', 'Ayadim'],
    'Nsit Atai': ['Nsit Atai', 'Ikot Ekpene', 'Ini', 'Ikot Ibiok', 'Afaha Ikot'],
    'Nsit Ibom': ['Nsit Ibom', 'Ikot Ekpene', 'Abak', 'Ikot Ibiok', 'Afaha Ikot'],
    'Nsit Ubium': ['Nsit Ubium', 'Ikot Ekpene', 'Etinan', 'Ikot Ibiok', 'Nwaniba'],
    'Obot Akara': ['Obot Akara', 'Itu', 'Eket', 'Ukam', 'Ibiaku Utit'],
    'Oron': ['Oron', 'Ikot Abasi', 'Eastern Obolo', 'Iyat', 'Ayadim'],
    'Uyo': ['Uyo', 'Uruan', 'Etinan', 'Abak', 'Nwaniba'],
  },
  'Lagos': {
    'Agege': ['Agege', 'Kara', 'Okota', 'Isolo', 'Shogunle'],
    'Ajeromi-Ifelodun': ['Ajeromi', 'Ifelodun', 'Apapa', 'Ijora', 'Costain'],
    'Alimosho': ['Alimosho', 'Mowe', 'Ifo', 'Jajiji', 'Ilogbo'],
    'Amuwo Odofin': ['Amuwo Odofin', 'Eko Atlantic', 'Alaro', 'Lekki', 'Ikoyi'],
    'Apapa': ['Apapa', 'Ijora', 'Costain', 'Tincan Island', 'Kirikiri'],
    'Badagry': ['Badagry', 'Olorunda', 'Agbara', 'Seme', 'Gberigbe'],
    'Bariga': ['Bariga', 'Shomolu', 'Surulere', 'Itire', 'Ijesha'],
    'Epe': ['Epe', 'Ibeju Lekki', 'Ajah', 'Lekki', 'Ikorodu'],
    'Eti-Osa': ['Eti-Osa', 'Ikoyi', 'Victoria Island', 'Lekki', 'Ibeju Lekki'],
    'Ifako-Ijaye': ['Ifako', 'Ijaye', 'Alagbado', 'Iju', 'Alagbole'],
    'Ikoyi': ['Ikoyi', 'Victoria Island', 'Lekki', 'Ajah', 'Ikoyi East'],
    'Ikorodu': ['Ikorodu', 'Imota', 'Ijede', 'Iwopin', 'Magbon'],
    'Isolo': ['Isolo', 'Oshodi', 'Oke Odo', 'Ilupeju', 'Shogunle'],
    'Lagos Island': ['Lagos Island', 'Ikoyi', 'Victoria Island', 'Ajah', 'Lekki'],
    'Lagos Mainland': ['Lagos Mainland', 'Bariga', 'Yaba', 'Onikan', 'Lekki'],
    'Lekki': ['Lekki', 'Ajah', 'Ibeju Lekki', 'Epe', 'Victoria Island'],
    'Mushin': ['Mushin', 'Bariga', 'Surulere', 'Itire', 'Ijesha'],
    'Ojo': ['Ojo', 'Apapa', 'Ajegunna', 'Akinpelu', 'Orile Agege'],
    'Oshodi-Isolo': ['Oshodi', 'Isolo', 'Shogunle', 'Mafoluku', 'Ilupeju'],
    'Shomolu': ['Shomolu', 'Bariga', 'Itire', 'Ijesha', 'Surulere'],
    'Surulere': ['Surulere', 'Ijesha', 'Itire', 'Bariga', 'Ojuelegba'],
    'Ajah': ['Ajah', 'Lekki', 'Epe', 'Ibeju Lekki', 'Eti-Osa'],
    'Ibeju-Lekki': ['Ibeju Lekki', 'Epe', 'Ajah', 'Lekki', 'Ikorodu'],
  },
  'Oyo': {
    'Ibadan North': ['Ibadan', 'Onireke', 'Bodija', 'Jericho', 'GRA Ibadan'],
    'Ibadan North East': ['Ibadan', 'Bashorun', 'Iwo Road', 'Alalubosa', 'Eleyele'],
    'Ibadan North West': ['Ibadan', 'Akala', 'Akinyele', 'Odo Ona', 'Isawo'],
    'Ibadan South': ['Ibadan', 'Dugbe', 'Mokola', 'Iwo Road', 'Adamasingba'],
    'Ibadan South East': ['Ibadan', 'Akobo', 'Ayanwale', 'Olomi', 'Soka'],
    'Ibadan South West': ['Ibadan', 'Oke Do', 'Oke Pelu', 'Aremo', 'Yemoja'],
    'Ido': ['Ido', 'Ibadan', 'Tapa', 'Onipe', 'Agbore'],
    'Iseyin': ['Iseyin', 'Ibadan', 'Kisi', 'Eruwa', 'Kanla'],
    'Atiba': ['Atiba', 'Oyo Town', 'Ijaye', 'Ago', 'Ogunjimi'],
    'Egbedore': ['Egbedore', 'Ibadan', 'Sepeteri', 'Akinogun', 'Alao'],
    'Ogbomoso North': ['Ogbomoso', 'Ibadan', 'Lanlate', 'Iwopin', 'Ajaawa'],
    'Ogbomoso South': ['Ogbomoso', 'Ibadan', 'Saki', 'Iseyin', 'Iwo'],
    'Oyo East': ['Oyo', 'Atiba', 'Kisi', 'Ago', 'Ayete'],
    'Oyo North': ['Oyo', 'Kisi', 'Ago Owu', 'Ayete', 'Atiba'],
    'Akinyele': ['Akinyele', 'Moniya', 'Sanyo', 'Ilora', 'Apete'],
    'Lagelu': ['Lagelu', 'Ibadan', 'Eleyele', 'Jericho', 'Bashorun'],
    'Ona Ara': ['Ona Ara', 'Ibadan', 'Ojoo', 'Moniya', 'Sanda'],
    'Oluyole': ['Oluyole', 'Ibadan', 'Ijebu Jesa', 'Abeokuta', 'Eruwa'],
    'Surulere': ['Surulere', 'Ibadan', 'Ijebu Jesa', 'Eruwa', 'Iseyin'],
  },
  'Federal Capital Territory': {
    'Abuja Municipal': ['Garki', 'Wuse', 'Asokoro', 'Maitama', 'Central Business District'],
    'Bwari': ['Bwari', 'Abaji', 'Kubwa', 'Gwagwa', 'Dure'],
    'Gwagwalada': ['Gwagwalada', 'Kuje', 'Abaji', 'Kubwa', 'Suleja'],
    'Kuje': ['Kuje', 'Abaji', 'Gwagwalada', 'Jikwoyi', 'Lugbe'],
    'Kwali': ['Kwali', 'Kuje', 'Abaji', 'Gwagwalada', 'Rubochi'],
  },
  'Rivers': {
    'Abua Odual': ['Abua', 'Odual', 'Ahoada East', 'Emohua', 'Ahoada West'],
    'Ahoada East': ['Ahoada East', 'Abua', 'Odual', 'Emohua', 'Ahoada West'],
    'Ahoada West': ['Ahoada West', 'Ahoada East', 'Emohua', 'Abua', 'Odual'],
    'Akuku-Toru': ['Akuku', 'Toru', 'Tai', 'Eleme', 'Ogoni'],
    'Andoni': ['Andoni', 'Opobo', 'Nkoro', 'Bonny', 'Kalabari'],
    'Asari-Toru': ['Asari', 'Toru', 'Tai', 'Akuku', 'Eleme'],
    'Bonny': ['Bonny', 'Opobo', 'Nkoro', 'Andoni', 'Kalabari'],
    'Degema': ['Degema', 'Ogoni', 'Gokana', 'Khana', 'Tai'],
    'Eleme': ['Eleme', 'Tai', 'Ogoni', 'Gokana', 'Akuku'],
    'Emohua': ['Emohua', 'Ahoada East', 'Abua', 'Odual', 'Ahoada West'],
    'Etche': ['Etche', 'Tai', 'Ogoni', 'Eleme', 'Akuku'],
    'Gokana': ['Gokana', 'Khana', 'Ogoni', 'Degema', 'Tai'],
    'Ibama': ['Ibama', 'Tai', 'Etche', 'Eleme', 'Akuku'],
    'Ikwerre': ['Ikwerre', 'Obio Akpor', 'Port Harcourt', 'Oyigbo', 'Etche'],
    'Isiokpo': ['Isiokpo', 'Ikwerre', 'Obio Akpor', 'Port Harcourt', 'Oyigbo'],
    'Khana': ['Khana', 'Gokana', 'Ogoni', 'Degema', 'Tai'],
    'Obio Akpor': ['Obio Akpor', 'Port Harcourt', 'Ikwerre', 'Oyigbo', 'Etche'],
    'Ogoni': ['Ogoni', 'Gokana', 'Khana', 'Tai', 'Degema'],
    'Opobo Nkoro': ['Opobo', 'Nkoro', 'Bonny', 'Andoni', 'Kalabari'],
    'Oyigbo': ['Oyigbo', 'Etche', 'Ikwerre', 'Obio Akpor', 'Port Harcourt'],
    'Port Harcourt': ['Port Harcourt', 'Obio Akpor', 'Ikwerre', 'Oyigbo', 'Etche'],
    'Tai': ['Tai', 'Eleme', 'Ogoni', 'Akuku', 'Etche'],
  },
  'Enugu': {
    'Aninri': ['Aninri', 'Enugu', 'Nsukka', 'Oji River', 'Uda'],
    'Awgu': ['Awgu', 'Enugu', 'Aninri', 'Oji River', 'Uda'],
    'Enugu East': ['Enugu', 'Aninri', 'Enugu North', 'Oji River', 'Uda'],
    'Enugu North': ['Enugu', 'Aninri', 'Enugu South', 'Enugu East', 'Uda'],
    'Enugu South': ['Enugu', 'Aninri', 'Enugu East', 'Enugu North', 'Uda'],
    'Ezeagu': ['Ezeagu', 'Awgu', 'Enugu', 'Oji River', 'Uda'],
    'Igbo Eze North': ['Igbo Eze', 'Nsukka', 'Enugu', 'Oji River', 'Uda'],
    'Igbo Eze South': ['Igbo Eze', 'Nsukka', 'Enugu', 'Oji River', 'Uda'],
    'Igbo Etiti': ['Igbo Etiti', 'Aninri', 'Enugu', 'Nsukka', 'Oji River'],
    'Isi Uzo': ['Isi Uzo', 'Nsukka', 'Igbo Eze', 'Enugu', 'Oji River'],
    'Nkanu East': ['Nkanu', 'Awgu', 'Ezeagu', 'Oji River', 'Uda'],
    'Nkanu West': ['Nkanu', 'Awgu', 'Ezeagu', 'Oji River', 'Uda'],
    'Nsukka': ['Nsukka', 'Igbo Eze', 'Enugu', 'Oji River', 'Uda'],
    'Oji River': ['Oji River', 'Enugu', 'Awgu', 'Ezeagu', 'Aninri'],
    'Udenu': ['Udenu', 'Nsukka', 'Igbo Eze', 'Enugu', 'Oji River'],
    'Uzo Uwani': ['Uzo Uwani', 'Aninri', 'Enugu', 'Nsukka', 'Oji River'],
  },
  'Kano': {
    'Ajinkyia': ['Ajinkyia', 'Kano', 'Gwale', 'Fagge', 'Doguwa'],
    'Albasa': ['Albasa', 'Kano', 'Gwale', 'Fagge', 'Doguwa'],
    'Bebeji': ['Bebeji', 'Kano', 'Sumaila', 'Doguwa', 'Kunchi'],
    'Bichi': ['Bichi', 'Kano', 'Warawa', 'Kumbotso', 'Kura'],
    'Bunkure': ['Bunkure', 'Kano', 'Minjibir', 'Gwarzo', 'Kunchi'],
    'Dala': ['Dala', 'Kano', 'Nassarawa', 'Kachumbari', 'Kurkur'],
    'Dawakin Kudu': ['Dawakin Kudu', 'Kano', 'Batagarawa', 'Garun Mallam', 'Kaita'],
    'Dawakin Tofa': ['Dawakin Tofa', 'Kano', 'Dawakin Kudu', 'Gaya', 'Karfi'],
    'Doguwa': ['Doguwa', 'Kano', 'Sumaila', 'Bebeji', 'Kunchi'],
    'Fagge': ['Fagge', 'Kano', 'Gwale', 'Ajinkyia', 'Kano Municipal'],
    'Gabasawa': ['Gabasawa', 'Kano', 'Minjibir', 'Bunkure', 'Gwarzo'],
    'Garko': ['Garko', 'Kano', 'Nassarawa', 'Dala', 'Kachumbari'],
    'Garun Mallam': ['Garun Mallam', 'Kano', 'Dawakin Kudu', 'Kaita', 'Batagarawa'],
    'Gaya': ['Gaya', 'Kano', 'Dawakin Tofa', 'Karfi', 'Rimin Gado'],
    'Gezawa': ['Gezawa', 'Kano', 'Sumaila', 'Rano', 'Bebeji'],
    'Gwale': ['Gwale', 'Kano', 'Fagge', 'Ajinkyia', 'Kumbotso'],
    'Gwarzo': ['Gwarzo', 'Kano', 'Bunkure', 'Minjibir', 'Gabasawa'],
    'Kabo': ['Kabo', 'Kano', 'Sumaila', 'Rano', 'Gezawa'],
    'Kachumbari': ['Kachumbari', 'Kano', 'Dala', 'Kurkur', 'Nassarawa'],
    'Kaia': ['Kaia', 'Kano', 'Dawakin Kudu', 'Garun Mallam', 'Kaita'],
    'Kajiji': ['Kajiji', 'Kano', 'Nassarawa', 'Dala', 'Kurkur'],
    'Kaki': ['Kaki', 'Kano', 'Garko', 'Nassarawa', 'Dala'],
    'Kano Municipal': ['Kano', 'Gwale', 'Fagge', 'Kumbotso', 'Doguwa'],
    'Karfi': ['Karfi', 'Kano', 'Gaya', 'Rimin Gado', 'Tarauni'],
    'Karaye': ['Karaye', 'Kano', 'Gezawa', 'Rano', 'Kabo'],
    'Kaura Namoda': ['Kaura Namoda', 'Kano', 'Dawakin Tofa', 'Gaya', 'Karfi'],
    'Kaya': ['Kaya', 'Kano', 'Dawakin Kudu', 'Garun Mallam', 'Kaita'],
    'Kiri': ['Kiri', 'Kano', 'Dawakin Tofa', 'Gaya', 'Karfi'],
    'Kumbotso': ['Kumbotso', 'Kano', 'Gwale', 'Fagge', 'Kano Municipal'],
    'Kunchi': ['Kunchi', 'Kano', 'Bebeji', 'Bunkure', 'Gwarzo'],
    'Kura': ['Kura', 'Kano', 'Bichi', 'Warawa', 'Kumbotso'],
    'Kurkur': ['Kurkur', 'Kano', 'Nassarawa', 'Dala', 'Kachumbari'],
    'Kuwai': ['Kuwai', 'Kano', 'Dala', 'Nassarawa', 'Kurkur'],
    'Minjibir': ['Minjibir', 'Kano', 'Bunkure', 'Gabasawa', 'Gwarzo'],
    'Nasarawa': ['Nassarawa', 'Kano', 'Dala', 'Kurkur', 'Kachumbari'],
    'Rano': ['Rano', 'Kano', 'Sumaila', 'Gezawa', 'Kabo'],
    'Rimin Gado': ['Rimin Gado', 'Kano', 'Gaya', 'Karfi', 'Tarauni'],
    'Rogo': ['Rogo', 'Kano', 'Karaye', 'Gezawa', 'Rano'],
    'Sanibari': ['Sanibari', 'Kano', 'Batagarawa', 'Dawakin Kudu', 'Garun Mallam'],
    'Sumaila': ['Sumaila', 'Kano', 'Doguwa', 'Bebeji', 'Kunchi'],
    'Tarauni': ['Tarauni', 'Kano', 'Karaye', 'Rimin Gado', 'Karfi'],
    'Takai': ['Takai', 'Kano', 'Gaya', 'Dawakin Tofa', 'Karfi'],
    'Taskade': ['Taskade', 'Kano', 'Batagarawa', 'Dawakin Kudu', 'Garun Mallam'],
    'Tudun Maliki': ['Tudun Maliki', 'Kano', 'Dawakin Kudu', 'Kaita', 'Garun Mallam'],
    'Tungar': ['Tungar', 'Kano', 'Bunkure', 'Minjibir', 'Gwarzo'],
    'Ungogo': ['Ungogo', 'Kano', 'Nassarawa', 'Dala', 'Kurkur'],
    'Warawa': ['Warawa', 'Kano', 'Bichi', 'Kumbotso', 'Kura'],
  },
}


interface LocationInputProps {
  value: {
    community: string
    lga: string
    state: string
    country: string
  }
  onChange: (location: {
    community: string
    lga: string
    state: string
    country: string
  }) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [openDropdown, setOpenDropdown] = useState<'state' | 'lga' | 'community' | null>(null)

  const states = Object.keys(nigerianLocations).sort()
  const lgas = value.state ? Object.keys(nigerianLocations[value.state] || {}).sort() : []
  const communities = value.state && value.lga 
    ? (nigerianLocations[value.state]?.[value.lga] || []).sort()
    : []

  const locationText = [value.community, value.lga, value.state, 'Nigeria'].filter(Boolean).join(', ')

  const handleStateSelect = (state: string) => {
    onChange({
      country: 'Nigeria',
      state,
      lga: '',
      community: '',
    })
    setOpenDropdown('lga')
  }

  const handleLgaSelect = (lga: string) => {
    onChange({
      ...value,
      lga,
      community: '',
    })
    setOpenDropdown('community')
  }

  const handleCommunitySelect = (community: string) => {
    onChange({
      ...value,
      community,
    })
    setOpenDropdown(null)
  }

  return (
    <div>
      <h3 className="font-medium mb-3">Location</h3>
      <div className="space-y-3">
        {/* Display Button */}
        <button
          onClick={() => setOpenDropdown(openDropdown ? null : 'state')}
          className="w-full flex items-center justify-between h-14 rounded-2xl border border-border px-4 bg-background hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className={cn('text-sm', locationText ? 'text-foreground' : 'text-muted-foreground')}>
              {locationText || 'Select location'}
            </span>
          </div>
          <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', openDropdown && 'rotate-180')} />
        </button>

        {/* State Dropdown */}
        {openDropdown === 'state' && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT STATE</label>
            <div className="space-y-1">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => handleStateSelect(state)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    value.state === state
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LGA Dropdown */}
        {openDropdown === 'lga' && value.state && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT LGA</label>
            <div className="space-y-1">
              {lgas.map((lga) => (
                <button
                  key={lga}
                  onClick={() => handleLgaSelect(lga)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    value.lga === lga
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  {lga}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Community Dropdown */}
        {openDropdown === 'community' && value.state && value.lga && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT COMMUNITY</label>
            <div className="space-y-1">
              {communities.map((community) => (
                <button
                  key={community}
                  onClick={() => handleCommunitySelect(community)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    value.community === community
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  {community}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
