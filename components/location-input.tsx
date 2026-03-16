'use client'

import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

// Complete Nigerian location data - State → LGA → Cities
const nigerianLocations: Record<string, Record<string, string[]>> = {
  'Abia': {
    'Aba North': ['Aba', 'Ekezie', 'Ntigha'],
    'Aba South': ['Aba', 'Muri', 'Ogbor Hill'],
    'Arochukwu': ['Arochukwu', 'Ohafia', 'Ozu Abam'],
    'Bende': ['Bende', 'Okigwe', 'Ogo Mbakpa'],
    'Ikwuano': ['Ikwuano', 'Ibeku', 'Okpuala'],
    'Isuikwuato': ['Isuikwuato', 'Umunneochi', 'Abam'],
    'Obi Ngwa': ['Aba', 'Itumbauzo', 'Obinagu'],
    'Ohafia': ['Ohafia', 'Arochukwu', 'Afo Uno'],
    'Osisioma': ['Aba', 'Owerrinta', 'Apata'],
    'Ugwunagbo': ['Calabar Road', 'Ikot Ekpene Road', 'Ezeoke'],
    'Ukwa East': ['Ukwa', 'Igbere', 'Oron'],
    'Ukwa West': ['Ukwa', 'Mma', 'Igbere'],
    'Umuahia North': ['Umuahia', 'Ibeku', 'Olokoro'],
    'Umuahia South': ['Umuahia', 'Ubakala', 'Itumbauzo'],
    'Umu Nneochi': ['Umu Nneochi', 'Isuikwuato', 'Uturu'],
  },
  'Adamawa': {
    'Demsa': ['Demsa', 'Gire', 'Gombi'],
    'Fufore': ['Fufore', 'Djingliya', 'Maina'],
    'Ganye': ['Ganye', 'Toungo', 'Jada'],
    'Girei': ['Girei', 'Mubi', 'Michika'],
    'Gombi': ['Gombi', 'Demsa', 'Gire'],
    'Guyuk': ['Guyuk', 'Jada', 'Mayo-Belwa'],
    'Hong': ['Hong', 'Demsa', 'Fufore'],
    'Jada': ['Jada', 'Guyuk', 'Toungo'],
    'Lamurde': ['Lamurde', 'Demsa', 'Mubi North'],
    'Madagali': ['Madagali', 'Michika', 'Mubi South'],
    'Maiha': ['Maiha', 'Michika', 'Mubi North'],
    'Mayo-Belwa': ['Mayo-Belwa', 'Guyuk', 'Jada'],
    'Michika': ['Michika', 'Madagali', 'Mubi South'],
    'Mubi North': ['Mubi', 'Maiha', 'Lamurde'],
    'Mubi South': ['Mubi', 'Madagali', 'Michika'],
    'Numan': ['Numan', 'Demsa', 'Lamurde'],
    'Shelleng': ['Shelleng', 'Fufore', 'Demsa'],
    'Song': ['Song', 'Guyuk', 'Ganye'],
    'Toungo': ['Toungo', 'Jada', 'Ganye'],
    'Yola North': ['Yola', 'Jimeta', 'Girei'],
    'Yola South': ['Yola', 'Jimeta', 'Girei'],
  },
  'Akwa Ibom': {
    'Abak': ['Abak', 'Uyo', 'Itu'],
    'Eastern Obolo': ['Eastern Obolo', 'Oron', 'Akamkpa'],
    'Eket': ['Eket', 'Ibeno', 'Ibesikpo'],
    'Esit Eket': ['Esit Eket', 'Eket', 'Ibeno'],
    'Essien Udim': ['Essien Udim', 'Ikot Ekpene', 'Abak'],
    'Etim Ekpo': ['Etim Ekpo', 'Ibiono', 'Itu'],
    'Etinan': ['Etinan', 'Itu', 'Eket'],
    'Ibeno': ['Ibeno', 'Eket', 'Oron'],
    'Ibesikpo': ['Ibesikpo', 'Eket', 'Ibeno'],
    'Ibiono Ibom': ['Ibiono', 'Etim Ekpo', 'Ini'],
    'Iko': ['Iko', 'Oron', 'Eastern Obolo'],
    'Ikot Abasi': ['Ikot Abasi', 'Oron', 'Eket'],
    'Ikot Ekpene': ['Ikot Ekpene', 'Abak', 'Essien Udim'],
    'Ini': ['Ini', 'Ibiono', 'Etim Ekpo'],
    'Itu': ['Itu', 'Etinan', 'Abak'],
    'Mbo': ['Mbo', 'Oron', 'Iko'],
    'Nsit Atai': ['Nsit Atai', 'Ikot Ekpene', 'Ini'],
    'Nsit Ibom': ['Nsit Ibom', 'Ikot Ekpene', 'Abak'],
    'Nsit Ubium': ['Nsit Ubium', 'Ikot Ekpene', 'Etinan'],
    'Obot Akara': ['Obot Akara', 'Itu', 'Eket'],
    'Oron': ['Oron', 'Ikot Abasi', 'Eastern Obolo'],
    'Uyo': ['Uyo', 'Uruan', 'Etinan'],
  },
  'Anambra': {
    'Aguata': ['Aguata', 'Ekwulobia', 'Oraifite'],
    'Anambra East': ['Colei', 'Nsugbe', 'Amanzi'],
    'Anambra West': ['Nkwelle', 'Omor', 'Obi'],
    'Anaocha': ['Nri', 'Abagana', 'Njikoka'],
    'Awka North': ['Awka', 'Achalla', 'Nimo'],
    'Awka South': ['Awka', 'Nnewi', 'Ozubulu'],
    'Ayamelum': ['Anaku', 'Amansiodo', 'Omor'],
    'Dunukofia': ['Umunya', 'Nri', 'Amanzi'],
    'Ekwusigo': ['Oraifite', 'Ekwulobia', 'Nnewi South'],
    'Idemili North': ['Nnewi', 'Ozo', 'Eziama'],
    'Idemili South': ['Ozubulu', 'Nnewi', 'Oraifite'],
    'Ihiala': ['Ihiala', 'Ogidi', 'Okija'],
    'Njikoka': ['Njikoka', 'Nri', 'Abagana'],
    'Nnewi North': ['Nnewi', 'Ichi', 'Eziama'],
    'Nnewi South': ['Nnewi', 'Oraifite', 'Ekwulobia'],
    'Ogbaru': ['Ogbaru', 'Umunze', 'Anaku'],
    'Onitsha North': ['Onitsha', 'Ogbaru', 'Obosi'],
    'Onitsha South': ['Onitsha', 'Nnewi', 'Ihiala'],
    'Orumba North': ['Oraifite', 'Aguata', 'Ekwulobia'],
    'Orumba South': ['Ekwulobia', 'Aguata', 'Oraifite'],
    'Oyi': ['Ogidi', 'Nsukka', 'Lejja'],
  },
  'Bauchi': {
    'Alkaleri': ['Alkaleri', 'Bauchi', 'Jemaa'],
    'Bauchi': ['Bauchi', 'Yelwa', 'Katagum'],
    'Baure': ['Baure', 'Lere', 'Yakuba'],
    'Bogoro': ['Bogoro', 'Bauchi', 'Giade'],
    'Dambam': ['Dambam', 'Alkaleri', 'Jemaa'],
    'Darazo': ['Darazo', 'Azare', 'Katagum'],
    'Dass': ['Dass', 'Bauchi', 'Giade'],
    'Gada': ['Gada', 'Dass', 'Bauchi'],
    'Giade': ['Giade', 'Bogoro', 'Dass'],
    'Itas Gadau': ['Itas Gadau', 'Bauchi', 'Yelwa'],
    'Jemaa': ['Jemaa', 'Dambam', 'Alkaleri'],
    'Katagum': ['Katagum', 'Azare', 'Bauchi'],
    'Kirfi': ['Kirfi', 'Bauchi', 'Lere'],
    'Lere': ['Lere', 'Baure', 'Kirfi'],
    'Shira': ['Shira', 'Gada', 'Dass'],
    'Tafawa Balewa': ['Tafawa Balewa', 'Bauchi', 'Gada'],
    'Toro': ['Toro', 'Bauchi', 'Katagum'],
    'Warji': ['Warji', 'Baure', 'Lere'],
    'Yakuba': ['Yakuba', 'Baure', 'Lere'],
    'Yelwa': ['Yelwa', 'Bauchi', 'Katagum'],
    'Zaki': ['Zaki', 'Azare', 'Katagum'],
  },
  'Bayelsa': {
    'Brass': ['Brass', 'Nembe', 'Akassa'],
    'Ekeremor': ['Ekeremor', 'Ogbia', 'Nembe'],
    'Epie Atissa': ['Yenagoa', 'Onopa', 'Gbarain'],
    'Khana': ['Khana', 'Ogbia', 'Nembe'],
    'Kolokuma Opokuma': ['Kolokuma', 'Ogbia', 'Nembe'],
    'Nembe': ['Nembe', 'Brass', 'Ekeremor'],
    'Ogbia': ['Ogbia', 'Khana', 'Kolokuma'],
    'Sagbama': ['Sagbama', 'Ekeremor', 'Ogbia'],
    'Southern Ijaw': ['Ijaw', 'Brass', 'Nembe'],
    'Yenagoa': ['Yenagoa', 'Epie Atissa', 'Sagbama'],
  },
  'Benue': {
    'Ado': ['Ado', 'Mkpat Enin', 'Oturkpo'],
    'Agatu': ['Agatu', 'Ado', 'Otukpo'],
    'Apa': ['Apa', 'Agatu', 'Otukpo'],
    'Buruku': ['Buruku', 'Gboko', 'Tiv'],
    'Gboko': ['Gboko', 'Buruku', 'Makurdi'],
    'Guma': ['Guma', 'Makurdi', 'Logo'],
    'Katsina Ala': ['Katsina Ala', 'Ukum', 'Logo'],
    'Konshisha': ['Konshisha', 'Katsina Ala', 'Logo'],
    'Makurdi': ['Makurdi', 'Guma', 'Gboko'],
    'Obi': ['Obi', 'Makurdi', 'Guma'],
    'Ogbadibo': ['Ogbadibo', 'Ado', 'Otukpo'],
    'Otukpo': ['Otukpo', 'Ado', 'Ogbadibo'],
    'Tarka': ['Tarka', 'Gboko', 'Makurdi'],
    'Ukum': ['Ukum', 'Katsina Ala', 'Buruku'],
    'Ushongo': ['Ushongo', 'Katsina Ala', 'Konshisha'],
    'Vandeikya': ['Vandeikya', 'Agatu', 'Apa'],
  },
  'Borno': {
    'Abadam': ['Abadam', 'Guzamala', 'Marte'],
    'Askira Uba': ['Askira Uba', 'Bama', 'Gwoza'],
    'Bama': ['Bama', 'Askira Uba', 'Gwoza'],
    'Biu': ['Biu', 'Gwoza', 'Chibok'],
    'Bukarkolom': ['Bukarkolom', 'Mobbar', 'Abadam'],
    'Bulabulin': ['Bulabulin', 'Maiduguri', 'Munguno'],
    'Chibok': ['Chibok', 'Biu', 'Damboa'],
    'Damboa': ['Damboa', 'Chibok', 'Maiduguri'],
    'Dikwa': ['Dikwa', 'Kaga', 'Magumeri'],
    'Dusnma': ['Dusnma', 'Gwoza', 'Biu'],
    'Gamboru': ['Gamboru', 'Ngala', 'Marte'],
    'Guzamala': ['Guzamala', 'Abadam', 'Marte'],
    'Gwoza': ['Gwoza', 'Askira Uba', 'Biu'],
    'Jere': ['Jere', 'Maiduguri', 'Damboa'],
    'Kaga': ['Kaga', 'Dikwa', 'Magumeri'],
    'Kala Balge': ['Kala Balge', 'Kaga', 'Dikwa'],
    'Kanem': ['Kanem', 'Mobbar', 'Guzamala'],
    'Kangarum': ['Kangarum', 'Magumeri', 'Kaga'],
    'Konduga': ['Konduga', 'Jere', 'Damboa'],
    'Kukawa': ['Kukawa', 'Kanem', 'Mobbar'],
    'Kwaya Kusar': ['Kwaya Kusar', 'Ngala', 'Gamboru'],
    'Maiduguri': ['Maiduguri', 'Jere', 'Konduga'],
    'Magumeri': ['Magumeri', 'Kaga', 'Kangarum'],
    'Marte': ['Marte', 'Abadam', 'Guzamala'],
    'Mobbar': ['Mobbar', 'Kanem', 'Kukawa'],
    'Munguno': ['Munguno', 'Bulabulin', 'Jere'],
    'Ngala': ['Ngala', 'Gamboru', 'Marte'],
    'Nganzai': ['Nganzai', 'Kanem', 'Mobbar'],
    'Shani': ['Shani', 'Dikwa', 'Kaga'],
  },
  'Cross River': {
    'Akamkpa': ['Akamkpa', 'Calabar South', 'Odukpani'],
    'Akpabuyo': ['Akpabuyo', 'Calabar South', 'Odukpani'],
    'Bakassi': ['Bakassi', 'Calabar South', 'Akpabuyo'],
    'Bekwarra': ['Bekwarra', 'Obudu', 'Boki'],
    'Biase': ['Biase', 'Akamkpa', 'Ikom'],
    'Boki': ['Boki', 'Bekwarra', 'Obudu'],
    'Calabar Municipality': ['Calabar', 'Marina', 'Waspener'],
    'Calabar South': ['Calabar South', 'Calabar Municipality', 'Akpabuyo'],
    'Etung': ['Etung', 'Ikom', 'Biase'],
    'Ikom': ['Ikom', 'Etung', 'Biase'],
    'Obubra': ['Obubra', 'Ikom', 'Yala'],
    'Obudu': ['Obudu', 'Boki', 'Bekwarra'],
    'Odukpani': ['Odukpani', 'Calabar South', 'Biase'],
    'Ogoja': ['Ogoja', 'Yala', 'Obubra'],
    'Okcukwu': ['Okcukwu', 'Ogoja', 'Obubra'],
    'Yakurr': ['Yakurr', 'Ogoja', 'Ikom'],
    'Yala': ['Yala', 'Obubra', 'Ogoja'],
  },
  'Delta': {
    'Aniocha North': ['Ibusa', 'Asaba', 'Onicha'],
    'Aniocha South': ['Agbor', 'Onicha', 'Ibusa'],
    'Bomadi': ['Bomadi', 'Burutu', 'Isoko South'],
    'Burutu': ['Burutu', 'Bomadi', 'Warri South'],
    'Ethiope East': ['Sapele', 'Warri', 'Abraka'],
    'Ethiope West': ['Sapele', 'Warri', 'Ewu'],
    'Ika North East': ['Ika', 'Onicha', 'Agbor'],
    'Ika South': ['Ika', 'Onicha', 'Agbor'],
    'Isoko North': ['Isoko', 'Bomadi', 'Warri South'],
    'Isoko South': ['Isoko', 'Bomadi', 'Burutu'],
    'Ndokwa East': ['Ndokwa', 'Asaba', 'Agbor'],
    'Ndokwa West': ['Ndokwa', 'Asaba', 'Agbor'],
    'Okpe': ['Okpe', 'Warri', 'Sapele'],
    'Oshimili North': ['Asaba', 'Ibusa', 'Onicha'],
    'Oshimili South': ['Asaba', 'Ibusa', 'Agbor'],
    'Patani': ['Patani', 'Bomadi', 'Isoko South'],
    'Sapele': ['Sapele', 'Okpe', 'Warri'],
    'Udu': ['Udu', 'Warri', 'Okpe'],
    'Ughelli North': ['Ughelli', 'Udu', 'Sapele'],
    'Ughelli South': ['Ughelli', 'Isoko North', 'Isoko South'],
    'Ukwuani': ['Ukwuani', 'Warri South', 'Bomadi'],
    'Uvwie': ['Uvwie', 'Warri', 'Udu'],
    'Warri North': ['Warri', 'Okpe', 'Udu'],
    'Warri South': ['Warri South', 'Warri', 'Warri North'],
    'Warri South West': ['Warri', 'Warri South', 'Burutu'],
  },
  'Ebonyi': {
    'Abakaliki': ['Abakaliki', 'Afikpo', 'Ebonyi'],
    'Afikpo North': ['Afikpo', 'Abakaliki', 'Gabu'],
    'Afikpo South': ['Afikpo', 'Abakaliki', 'Gabu'],
    'Ebonyi': ['Ebonyi', 'Abakaliki', 'Afikpo'],
    'Ezza North': ['Ezza', 'Abakaliki', 'Enugu'],
    'Ezza South': ['Ezza', 'Abakaliki', 'Enugu'],
    'Gabu': ['Gabu', 'Afikpo', 'Ebonyi'],
    'Ikwo': ['Ikwo', 'Afikpo', 'Gabu'],
    'Ishielu': ['Ishielu', 'Ezza North', 'Enugu'],
    'Isuikwu': ['Isuikwu', 'Abakaliki', 'Ezza'],
    'Ivo': ['Ivo', 'Abakaliki', 'Afikpo'],
    'Izzi': ['Izzi', 'Abakaliki', 'Ezza'],
    'Ohaozara': ['Ohaozara', 'Abakaliki', 'Ebonyi'],
    'Ohaukwu': ['Ohaukwu', 'Ezza North', 'Afikpo'],
    'Onicha': ['Onicha', 'Abakaliki', 'Afikpo'],
  },
  'Edo': {
    'Akoko Edo': ['Akoko', 'Owo', 'Ose'],
    'Auchi': ['Auchi', 'Benin', 'Ubiaja'],
    'Benin City': ['Benin City', 'Sapele Road', 'New Lagos Road'],
    'Egor': ['Egor', 'Benin City', 'Orhionmwon'],
    'Esan Central': ['Esan', 'Benin', 'Uzebba'],
    'Esan North East': ['Esan', 'Benin', 'Uzebba'],
    'Esan South East': ['Esan', 'Benin', 'Uzebba'],
    'Esan West': ['Esan', 'Benin', 'Auchi'],
    'Igueben': ['Igueben', 'Benin', 'Ubiaja'],
    'Oredo': ['Oredo', 'Benin City', 'Egor'],
    'Ovia North East': ['Ovia', 'Benin', 'Orhionmwon'],
    'Ovia South West': ['Ovia', 'Benin', 'Orhionmwon'],
    'Owan East': ['Owan', 'Auchi', 'Lokoja'],
    'Owan West': ['Owan', 'Auchi', 'Lokoja'],
    'Uhunmwonde': ['Uhunmwonde', 'Orhionmwon', 'Benin'],
  },
  'Ekiti': {
    'Ado': ['Ado', 'Iyin Ekiti', 'Agenebode'],
    'Akure': ['Akure', 'Ado', 'Iyin Ekiti'],
    'Ekiti East': ['Ekiti', 'Abakaliki', 'Gbonyin'],
    'Ekiti South West': ['Ekiti', 'Ila', 'Igbara'],
    'Ekiti West': ['Ekiti', 'Ila', 'Iragbiji'],
    'Emure': ['Emure', 'Ekiti', 'Agenebode'],
    'Gbonyin': ['Gbonyin', 'Ekiti East', 'Abakaliki'],
    'Ido Osi': ['Ido Osi', 'Ido Ekiti', 'Ilesa'],
    'Ijero': ['Ijero', 'Ekiti', 'Ado'],
    'Irepodun': ['Irepodun', 'Ikere', 'Ekiti'],
    'Iyin Ekiti': ['Iyin Ekiti', 'Ado', 'Gbonyin'],
    'Moba': ['Moba', 'Emure', 'Ekiti'],
    'Oye': ['Oye', 'Ekiti', 'Agenebode'],
  },
  'Enugu': {
    'Aninri': ['Aninri', 'Enugu', 'Nsukka'],
    'Awgu': ['Awgu', 'Enugu', 'Aninri'],
    'Enugu': ['Enugu', 'Aninri', 'Awgu'],
    'Enugu East': ['Enugu', 'Aninri', 'Enugu North'],
    'Enugu North': ['Enugu', 'Aninri', 'Enugu South'],
    'Enugu South': ['Enugu', 'Aninri', 'Enugu East'],
    'Ezeagu': ['Ezeagu', 'Awgu', 'Enugu'],
    'Igbo Eze North': ['Igbo Eze', 'Nsukka', 'Enugu'],
    'Igbo Eze South': ['Igbo Eze', 'Nsukka', 'Enugu'],
    'Igbo Etiti': ['Igbo Etiti', 'Aninri', 'Enugu'],
    'Isi Uzo': ['Isi Uzo', 'Nsukka', 'Igbo Eze'],
    'Nkanu': ['Nkanu', 'Awgu', 'Ezeagu'],
    'Nsukka': ['Nsukka', 'Igbo Eze', 'Enugu'],
    'Oji River': ['Oji River', 'Enugu', 'Awgu'],
    'Udenu': ['Udenu', 'Nsukka', 'Igbo Eze'],
    'Uzo Uwani': ['Uzo Uwani', 'Aninri', 'Enugu'],
  },
  'Gombe': {
    'Akko': ['Akko', 'Gombe', 'Balanga'],
    'Balanga': ['Balanga', 'Akko', 'Gombe'],
    'Billiri': ['Billiri', 'Gombe', 'Akko'],
    'Dukku': ['Dukku', 'Gombe', 'Balanga'],
    'Funakaye': ['Funakaye', 'Gombe', 'Kaltungo'],
    'Gombe': ['Gombe', 'Akko', 'Balanga'],
    'Kaltungo': ['Kaltungo', 'Funakaye', 'Gombe'],
    'Kwami': ['Kwami', 'Gombe', 'Balanga'],
    'Nafada': ['Nafada', 'Gombe', 'Dukku'],
    'Shongom': ['Shongom', 'Gombe', 'Billiri'],
    'Yamaltu Deba': ['Yamaltu Deba', 'Billiri', 'Gombe'],
  },
  'Imo': {
    'Aboh Mbaise': ['Aboh Mbaise', 'Mbaise', 'Umuahia'],
    'Ahiazu Mbaise': ['Ahiazu', 'Mbaise', 'Umuahia'],
    'Ehime Mbano': ['Ehime Mbano', 'Mbaise', 'Umuahia'],
    'Ezinihitte': ['Ezinihitte', 'Mbaise', 'Umuahia'],
    'Ikeduru': ['Ikeduru', 'Owerri', 'Mbaise'],
    'Isiala Mbano': ['Isiala Mbano', 'Mbaise', 'Umuahia'],
    'Mbaitoli': ['Mbaitoli', 'Owerri', 'Ikeduru'],
    'Ngor Okpala': ['Ngor Okpala', 'Owerri', 'Mbaitoli'],
    'Nkwerre': ['Nkwerre', 'Owerri', 'Ikeduru'],
    'Nwangele': ['Nwangele', 'Owerri', 'Ikeduru'],
    'Obowo': ['Obowo', 'Mbaise', 'Umuahia'],
    'Oguta': ['Oguta', 'Owerri', 'Ikeduru'],
    'Okigwe': ['Okigwe', 'Owerri', 'Mbaise'],
    'Onuimo': ['Onuimo', 'Owerri', 'Ikeduru'],
    'Oru East': ['Oru East', 'Owerri', 'Okigwe'],
    'Oru West': ['Oru West', 'Owerri', 'Okigwe'],
    'Owerri': ['Owerri', 'Owerri North', 'Owerri West'],
    'Owerri Municipal': ['Owerri', 'Owerri North', 'Owerri West'],
    'Owerri North': ['Owerri North', 'Owerri', 'Mbaitoli'],
    'Owerri West': ['Owerri West', 'Owerri', 'Mbaitoli'],
    'Unuimo': ['Unuimo', 'Owerri', 'Ikeduru'],
  },
  'Kano': {
    'Ajinkyia': ['Ajinkyia', 'Kano', 'Gwale'],
    'Albasa': ['Albasa', 'Kano', 'Gwale'],
    'Bebeji': ['Bebeji', 'Kano', 'Sumaila'],
    'Bichi': ['Bichi', 'Kano', 'Warawa'],
    'Bunkure': ['Bunkure', 'Kano', 'Minjibir'],
    'Dala': ['Dala', 'Kano', 'Nassarawa'],
    'Dawakin Kudu': ['Dawakin Kudu', 'Kano', 'Batagarawa'],
    'Dawakin Tofa': ['Dawakin Tofa', 'Kano', 'Dawakin Kudu'],
    'Doguwa': ['Doguwa', 'Kano', 'Sumaila'],
    'Fagge': ['Fagge', 'Kano', 'Gwale'],
    'Gabasawa': ['Gabasawa', 'Kano', 'Minjibir'],
    'Garko': ['Garko', 'Kano', 'Nassarawa'],
    'Garun Mallam': ['Garun Mallam', 'Kano', 'Dawakin Kudu'],
    'Gaya': ['Gaya', 'Kano', 'Dawakin Tofa'],
    'Gezawa': ['Gezawa', 'Kano', 'Sumaila'],
    'Gwale': ['Gwale', 'Kano', 'Fagge'],
    'Gwarzo': ['Gwarzo', 'Kano', 'Bunkure'],
    'Kabo': ['Kabo', 'Kano', 'Sumaila'],
    'Kachumbari': ['Kachumbari', 'Kano', 'Dala'],
    'Kaia': ['Kaia', 'Kano', 'Dawakin Kudu'],
    'Kajiji': ['Kajiji', 'Kano', 'Nassarawa'],
    'Kaki': ['Kaki', 'Kano', 'Garko'],
    'Kano Municipal': ['Kano', 'Gwale', 'Fagge'],
    'Karfi': ['Karfi', 'Kano', 'Gaya'],
    'Karaye': ['Karaye', 'Kano', 'Gezawa'],
    'Kaura Namoda': ['Kaura Namoda', 'Kano', 'Dawakin Tofa'],
    'Kaya': ['Kaya', 'Kano', 'Dawakin Kudu'],
    'Kiri': ['Kiri', 'Kano', 'Dawakin Tofa'],
    'Kumbotso': ['Kumbotso', 'Kano', 'Gwale'],
    'Kunchi': ['Kunchi', 'Kano', 'Bebeji'],
    'Kura': ['Kura', 'Jigawa', 'Kano'],
    'Kurkur': ['Kurkur', 'Kano', 'Nassarawa'],
    'Kuwai': ['Kuwai', 'Kano', 'Dala'],
    'Minjibir': ['Minjibir', 'Kano', 'Bunkure'],
    'Nasarawa': ['Nassarawa', 'Kano', 'Dala'],
    'Rano': ['Rano', 'Kano', 'Sumaila'],
    'Rimin Gado': ['Rimin Gado', 'Kano', 'Gaya'],
    'Rogo': ['Rogo', 'Kano', 'Karaye'],
    'Sanibari': ['Sanibari', 'Kano', 'Batagarawa'],
    'Sumaila': ['Sumaila', 'Kano', 'Doguwa'],
    'Takali': ['Takali', 'Kano', 'Dawakin Kudu'],
    'Takai': ['Takai', 'Kano', 'Gaya'],
    'Tarauni': ['Tarauni', 'Kano', 'Karaye'],
    'Taskade': ['Taskade', 'Kano', 'Batagarawa'],
    'Tudun Maliki': ['Tudun Maliki', 'Kano', 'Dawakin Kudu'],
    'Tungar': ['Tungar', 'Kano', 'Bunkure'],
    'Ungogo': ['Ungogo', 'Kano', 'Nassarawa'],
    'Warawa': ['Warawa', 'Kano', 'Bichi'],
  },
  'Katsina': {
    'Acida': ['Acida', 'Katsina', 'Katsina South'],
    'Baure': ['Baure', 'Katsina', 'Musawa'],
    'Bataiya': ['Bataiya', 'Katsina', 'Katsina South'],
    'Batsari': ['Batsari', 'Katsina', 'Faskari'],
    'Dandume': ['Dandume', 'Katsina', 'Faskari'],
    'Danja': ['Danja', 'Katsina', 'Batsari'],
    'Daura': ['Daura', 'Katsina', 'Mai Adua'],
    'Faskari': ['Faskari', 'Katsina', 'Batsari'],
    'Funtua': ['Funtua', 'Katsina', 'Katsina South'],
    'Gandi': ['Gandi', 'Katsina', 'Safiyanu'],
    'Ingawa': ['Ingawa', 'Katsina', 'Faskari'],
    'Jibia': ['Jibia', 'Katsina', 'Baure'],
    'Kafur': ['Kafur', 'Katsina', 'Faskari'],
    'Kaita': ['Kaita', 'Katsina', 'Daura'],
    'Kankara': ['Kankara', 'Katsina', 'Katsina South'],
    'Kankia': ['Kankia', 'Katsina', 'Bataiya'],
    'Kargi': ['Kargi', 'Katsina', 'Kankara'],
    'Katsina': ['Katsina', 'Acida', 'Bataiya'],
    'Katsina North': ['Katsina', 'Baure', 'Acida'],
    'Katsina South': ['Katsina', 'Funtua', 'Bataiya'],
    'Kurfi': ['Kurfi', 'Katsina', 'Faskari'],
    'Kusada': ['Kusada', 'Katsina', 'Daura'],
    'Mai Adua': ['Mai Adua', 'Katsina', 'Daura'],
    'Malumfashi': ['Malumfashi', 'Katsina', 'Kankara'],
    'Mani': ['Mani', 'Katsina', 'Kankara'],
    'Mashi': ['Mashi', 'Katsina', 'Katsina South'],
    'Matazu': ['Matazu', 'Katsina', 'Kankara'],
    'Musawa': ['Musawa', 'Katsina', 'Baure'],
    'Rimi': ['Rimi', 'Katsina', 'Acida'],
    'Sabuwa': ['Sabuwa', 'Katsina', 'Baure'],
    'Safiyanu': ['Safiyanu', 'Katsina', 'Gandi'],
    'Sandamu': ['Sandamu', 'Katsina', 'Katsina South'],
    'Tarki': ['Tarki', 'Katsina', 'Katsina South'],
    'Tumbau': ['Tumbau', 'Katsina', 'Faskari'],
    'Zango': ['Zango', 'Katsina', 'Kargi'],
  },
  'Kebbi': {
    'Aleiro': ['Aleiro', 'Kebbi', 'Kaoje'],
    'Argungu': ['Argungu', 'Kebbi', 'Buhari'],
    'Bagudo': ['Bagudo', 'Kebbi', 'Augie'],
    'Birnin Kebbi': ['Birnin Kebbi', 'Kebbi', 'Aliero'],
    'Bunza': ['Bunza', 'Kebbi', 'Buhari'],
    'Buhari': ['Buhari', 'Kebbi', 'Argungu'],
    'Dandi': ['Dandi', 'Kebbi', 'Gaya'],
    'Danko': ['Danko', 'Kebbi', 'Kaoje'],
    'Fakai': ['Fakai', 'Kebbi', 'Kaoje'],
    'Gaya': ['Gaya', 'Kebbi', 'Dandi'],
    'Gwandu': ['Gwandu', 'Kebbi', 'Birnin Kebbi'],
    'Jega': ['Jega', 'Kebbi', 'Gaya'],
    'Kaoje': ['Kaoje', 'Kebbi', 'Aleiro'],
    'Kari': ['Kari', 'Kebbi', 'Gaya'],
    'Koko': ['Koko', 'Kebbi', 'Sakaba'],
    'Kulle': ['Kulle', 'Kebbi', 'Kaoje'],
    'Maiyama': ['Maiyama', 'Kebbi', 'Birnin Kebbi'],
    'Makera': ['Makera', 'Kebbi', 'Aleiro'],
    'Malando': ['Malando', 'Kebbi', 'Kaoje'],
    'Mezuma': ['Mezuma', 'Kebbi', 'Sakaba'],
    'Paikoro': ['Paikoro', 'Kebbi', 'Birnin Kebbi'],
    'Sakaba': ['Sakaba', 'Kebbi', 'Koko'],
    'Saminaka': ['Saminaka', 'Kebbi', 'Argungu'],
    'Shanga': ['Shanga', 'Kebbi', 'Argungu'],
    'Suru': ['Suru', 'Kebbi', 'Dandi'],
    'Tanko': ['Tanko', 'Kebbi', 'Maiyama'],
    'Wasagu': ['Wasagu', 'Kebbi', 'Sakaba'],
    'Yauri': ['Yauri', 'Kebbi', 'Gaya'],
    'Zuru': ['Zuru', 'Kebbi', 'Sakaba'],
  },
  'Lagos': {
    'Agege': ['Agege', 'Lagos', 'Ifako-Ijaye'],
    'Ajeromi-Ifelodun': ['Ajeromi', 'Lagos', 'Apapa'],
    'Alimosho': ['Alimosho', 'Lagos', 'Mowe'],
    'Amuwo Odofin': ['Amuwo Odofin', 'Lagos', 'Isolo'],
    'Apapa': ['Apapa', 'Lagos', 'Ajeromi-Ifelodun'],
    'Badagry': ['Badagry', 'Lagos', 'Ogun'],
    'Bariga': ['Bariga', 'Lagos', 'Shomolu'],
    'Epe': ['Epe', 'Lagos', 'Ibeju-Lekki'],
    'Eti-Osa': ['Eti-Osa', 'Lagos', 'Ikoyi'],
    'Ifako-Ijaye': ['Ifako-Ijaye', 'Lagos', 'Agege'],
    'Ikoyi': ['Ikoyi', 'Lagos', 'Eti-Osa'],
    'Ikorodu': ['Ikorodu', 'Lagos', 'Alimosho'],
    'Isolo': ['Isolo', 'Lagos', 'Amuwo Odofin'],
    'Lagos Island': ['Lagos Island', 'Lagos', 'Eti-Osa'],
    'Lagos Mainland': ['Lagos Mainland', 'Lagos', 'Lagos Island'],
    'Lekki': ['Lekki', 'Lagos', 'Ajah'],
    'Mushin': ['Mushin', 'Lagos', 'Bariga'],
    'Ojo': ['Ojo', 'Lagos', 'Apapa'],
    'Oshodi-Isolo': ['Oshodi', 'Lagos', 'Isolo'],
    'Shomolu': ['Shomolu', 'Lagos', 'Bariga'],
    'Surulere': ['Surulere', 'Lagos', 'Lagos Island'],
    'Ajah': ['Ajah', 'Lagos', 'Lekki'],
    'Ibeju-Lekki': ['Ibeju-Lekki', 'Lagos', 'Epe'],
  },
  'Nasarawa': {
    'Akwanga': ['Akwanga', 'Nasarawa', 'Obi'],
    'Awe': ['Awe', 'Nasarawa', 'Akwanga'],
    'Dinder': ['Dinder', 'Nasarawa', 'Lafia'],
    'Garaku': ['Garaku', 'Nasarawa', 'Akwanga'],
    'Gaya': ['Gaya', 'Nasarawa', 'Lafia'],
    'Karu': ['Karu', 'Nasarawa', 'Lafia'],
    'Keana': ['Keana', 'Nasarawa', 'Akwanga'],
    'Kokona': ['Kokona', 'Nasarawa', 'Gaya'],
    'Keffi': ['Keffi', 'Nasarawa', 'Karu'],
    'Lafia': ['Lafia', 'Nasarawa', 'Dinder'],
    'Nasarawa': ['Nasarawa', 'Lafia', 'Keffi'],
    'Nasarawa Egon': ['Nasarawa Egon', 'Nasarawa', 'Akwanga'],
    'Obi': ['Obi', 'Nasarawa', 'Akwanga'],
    'Toto': ['Toto', 'Nasarawa', 'Keffi'],
    'Wamba': ['Wamba', 'Nasarawa', 'Akwanga'],
  },
  'Niger': {
    'Agaie': ['Agaie', 'Niger', 'Minna'],
    'Agwara': ['Agwara', 'Niger', 'Suleja'],
    'Bida': ['Bida', 'Niger', 'Suleja'],
    'Bosso': ['Bosso', 'Niger', 'Minna'],
    'Chachaga': ['Chachaga', 'Niger', 'Minna'],
    'Edati': ['Edati', 'Niger', 'Bida'],
    'Gbako': ['Gbako', 'Niger', 'Bida'],
    'Gurara': ['Gurara', 'Niger', 'Suleja'],
    'Katcha': ['Katcha', 'Niger', 'Bida'],
    'Kontagora': ['Kontagora', 'Niger', 'Bosso'],
    'Lapai': ['Lapai', 'Niger', 'Bida'],
    'Lavun': ['Lavun', 'Niger', 'Bida'],
    'Magama': ['Magama', 'Niger', 'Minna'],
    'Mariga': ['Mariga', 'Niger', 'Bosso'],
    'Mashegu': ['Mashegu', 'Niger', 'Minna'],
    'Minna': ['Minna', 'Niger', 'Bosso'],
    'Mokwa': ['Mokwa', 'Niger', 'Kontagora'],
    'Muya': ['Muya', 'Niger', 'Minna'],
    'Paikoro': ['Paikoro', 'Niger', 'Suleja'],
    'Rafi': ['Rafi', 'Niger', 'Kontagora'],
    'Rijau': ['Rijau', 'Niger', 'Kontagora'],
    'Shiroro': ['Shiroro', 'Niger', 'Bosso'],
    'Suleja': ['Suleja', 'Niger', 'Gurara'],
    'Tafa': ['Tafa', 'Niger', 'Suleja'],
    'Wushishi': ['Wushishi', 'Niger', 'Bida'],
  },
  'Ogun': {
    'Abeokuta North': ['Abeokuta', 'Ogun', 'Abeokuta South'],
    'Abeokuta South': ['Abeokuta', 'Ogun', 'Abeokuta North'],
    'Ado-Odo Ota': ['Ado Odo', 'Ogun', 'Mowe'],
    'Ijebu East': ['Ijebu', 'Ogun', 'Ijebu Ode'],
    'Ijebu North': ['Ijebu North', 'Ogun', 'Ijebu Ode'],
    'Ijebu Ode': ['Ijebu Ode', 'Ogun', 'Ijebu East'],
    'Ikenne': ['Ikenne', 'Ogun', 'Ijebu North'],
    'Imeko-Afijo': ['Imeko', 'Ogun', 'Yewa'],
    'Ipokia': ['Ipokia', 'Ogun', 'Yewa'],
    'Odeda': ['Odeda', 'Ogun', 'Abeokuta North'],
    'Odogbolu': ['Odogbolu', 'Ogun', 'Ijebu Ode'],
    'Remo North': ['Remo', 'Ogun', 'Ijebu East'],
    'Sagamu': ['Sagamu', 'Ogun', 'Remo North'],
    'Yewa North': ['Yewa', 'Ogun', 'Imeko'],
    'Yewa South': ['Yewa', 'Ogun', 'Imeko'],
    'Mowe': ['Mowe', 'Ogun', 'Ado-Odo Ota'],
  },
  'Ondo': {
    'Akoko North East': ['Akoko', 'Ondo', 'Owo'],
    'Akoko North West': ['Akoko', 'Ondo', 'Owo'],
    'Akoko South West': ['Akoko', 'Ondo', 'Owo'],
    'Akoko South East': ['Akoko', 'Ondo', 'Owo'],
    'Akure North': ['Akure', 'Ondo', 'Akure South'],
    'Akure South': ['Akure South', 'Ondo', 'Akure North'],
    'Akure': ['Akure', 'Ondo', 'Akure North'],
    'Ilaje': ['Ilaje', 'Ondo', 'Ondo Coastal'],
    'Ilawole': ['Ilawole', 'Ondo', 'Ondo'],
    'Irele': ['Irele', 'Ondo', 'Ondo Coastal'],
    'Ondo': ['Ondo', 'Ilaje', 'Irele'],
    'Ondo East': ['Ondo', 'Ondo West', 'Irele'],
    'Ondo West': ['Ondo West', 'Ondo', 'Ilaje'],
    'Ose': ['Ose', 'Ondo', 'Owo'],
    'Owo': ['Owo', 'Ose', 'Akoko'],
    'Oye': ['Oye', 'Ondo', 'Akure'],
  },
  'Osun': {
    'Aiyedade': ['Aiyedade', 'Osun', 'Ilesa'],
    'Atakunrin': ['Atakunrin', 'Osun', 'Osogbo'],
    'Ede': ['Ede', 'Osun', 'Osogbo'],
    'Egbedore': ['Egbedore', 'Osun', 'Osogbo'],
    'Ejigbo': ['Ejigbo', 'Osun', 'Osogbo'],
    'Giwa': ['Giwa', 'Osun', 'Osogbo'],
    'Ifelodun': ['Ifelodun', 'Osun', 'Osogbo'],
    'Ife Central': ['Ife', 'Osun', 'Ife East'],
    'Ife East': ['Ife', 'Osun', 'Ife Central'],
    'Ife North': ['Ife', 'Osun', 'Ife East'],
    'Ife South': ['Ife', 'Osun', 'Ife Central'],
    'Ila Orangun': ['Ila', 'Kwara', 'Osun'],
    'Ilesa': ['Ilesa', 'Osun', 'Ijebu Jesa'],
    'Ilesa East': ['Ilesa', 'Osun', 'Ilesa West'],
    'Ilesa West': ['Ilesa West', 'Osun', 'Ilesa'],
    'Ijebu Jesa': ['Ijebu Jesa', 'Osun', 'Ilesa'],
    'Isokan': ['Isokan', 'Osun', 'Osogbo'],
    'Isonyin': ['Isonyin', 'Osun', 'Osogbo'],
    'Obokun': ['Obokun', 'Osun', 'Ilesa'],
    'Olorunda': ['Olorunda', 'Osun', 'Osogbo'],
    'Osogbo': ['Osogbo', 'Osun', 'Ede'],
    'Owena': ['Owena', 'Osun', 'Osogbo'],
    'Oyere': ['Oyere', 'Osun', 'Osogbo'],
  },
  'Oyo': {
    'Afijio': ['Afijio', 'Oyo', 'Ibadan North'],
    'Akinyele': ['Akinyele', 'Oyo', 'Ibadan'],
    'Akobo': ['Akobo', 'Oyo', 'Ibadan South East'],
    'Atiba': ['Atiba', 'Oyo', 'Oyo'],
    'Atisbo': ['Atisbo', 'Oyo', 'Oyo'],
    'Egbeda': ['Egbeda', 'Oyo', 'Ibadan'],
    'Ibadan North': ['Ibadan North', 'Ibadan', 'Ibadan North East'],
    'Ibadan North East': ['Ibadan North East', 'Ibadan North', 'Ibadan East'],
    'Ibadan North West': ['Ibadan North West', 'Ibadan North', 'Ibadan'],
    'Ibadan South': ['Ibadan South', 'Ibadan South East', 'Ibadan South West'],
    'Ibadan South East': ['Ibadan South East', 'Ibadan South', 'Ibadan'],
    'Ibadan South West': ['Ibadan South West', 'Ibadan South', 'Ibadan'],
    'Ibarapa Central': ['Ibarapa Central', 'Oyo', 'Oyo'],
    'Ibarapa East': ['Ibarapa East', 'Oyo', 'Oyo'],
    'Ibarapa North': ['Ibarapa North', 'Oyo', 'Oyo'],
    'Ido': ['Ido', 'Oyo', 'Oyo'],
    'Irepodun': ['Irepodun', 'Oyo', 'Oyo'],
    'Iseyin': ['Iseyin', 'Oyo', 'Oyo North'],
    'Itesiwaju': ['Itesiwaju', 'Oyo', 'Oyo'],
    'Iwajowa': ['Iwajowa', 'Oyo', 'Oyo'],
    'Iyaganku': ['Iyaganku', 'Oyo', 'Oyo'],
    'Kajola': ['Kajola', 'Oyo', 'Oyo'],
    'Kanla': ['Kanla', 'Oyo', 'Oyo'],
    'Lagelu': ['Lagelu', 'Oyo', 'Ibadan'],
    'Lanlate': ['Lanlate', 'Oyo', 'Oyo'],
    'Ogbomoso North': ['Ogbomoso', 'Oyo', 'Oyo North'],
    'Ogbomoso South': ['Ogbomoso', 'Oyo', 'Oyo North'],
    'Olorunyomi': ['Olorunyomi', 'Oyo', 'Oyo'],
    'Oluyole': ['Oluyole', 'Oyo', 'Ibadan'],
    'Ona-Ara': ['Ona-Ara', 'Oyo', 'Ibadan'],
    'Orelope': ['Orelope', 'Oyo', 'Oyo'],
    'Oyo': ['Oyo', 'Oyo North', 'Oyo East'],
    'Oyo East': ['Oyo East', 'Oyo', 'Oyo North'],
    'Oyo North': ['Oyo North', 'Oyo', 'Oyo East'],
    'Saki East': ['Saki East', 'Oyo', 'Oyo'],
    'Saki West': ['Saki West', 'Oyo', 'Oyo'],
    'Surulere': ['Surulere', 'Oyo', 'Ibadan'],
  },
  'Plateau': {
    'Bokkos': ['Bokkos', 'Plateau', 'Riyom'],
    'Bassa': ['Bassa', 'Plateau', 'Jos South'],
    'Barkin Ladi': ['Barkin Ladi', 'Plateau', 'Jos North'],
    'Gindiri': ['Gindiri', 'Plateau', 'Mangu'],
    'Jos East': ['Jos East', 'Plateau', 'Jos North'],
    'Jos North': ['Jos North', 'Plateau', 'Jos East'],
    'Jos South': ['Jos South', 'Plateau', 'Jos North'],
    'Kanam': ['Kanam', 'Plateau', 'Giyeng'],
    'Kaura': ['Kaura', 'Plateau', 'Kanam'],
    'Langtang North': ['Langtang', 'Plateau', 'Langtang South'],
    'Langtang South': ['Langtang South', 'Plateau', 'Langtang North'],
    'Mangu': ['Mangu', 'Plateau', 'Gindiri'],
    'Pankshin': ['Pankshin', 'Plateau', 'Kanang'],
    'Riyom': ['Riyom', 'Plateau', 'Bokkos'],
    'Shendam': ['Shendam', 'Plateau', 'Kanam'],
    'Toro': ['Toro', 'Plateau', 'Kanam'],
    'Wase': ['Wase', 'Plateau', 'Pankshin'],
  },
  'Rivers': {
    'Abua Odual': ['Abua Odual', 'Rivers', 'Ahoada East'],
    'Ahoada East': ['Ahoada East', 'Rivers', 'Abua Odual'],
    'Ahoada West': ['Ahoada West', 'Rivers', 'Ahoada East'],
    'Akuku-Toru': ['Akuku-Toru', 'Rivers', 'Tai'],
    'Andoni': ['Andoni', 'Rivers', 'Opobo Nkoro'],
    'Asari-Toru': ['Asari-Toru', 'Rivers', 'Tai'],
    'Bonny': ['Bonny', 'Rivers', 'Opobo Nkoro'],
    'Degema': ['Degema', 'Rivers', 'Ogoni'],
    'Eleme': ['Eleme', 'Rivers', 'Tai'],
    'Emohua': ['Emohua', 'Rivers', 'Ahoada East'],
    'Etche': ['Etche', 'Rivers', 'Tai'],
    'Gokana': ['Gokana', 'Rivers', 'Tai'],
    'Gobo': ['Gobo', 'Rivers', 'Tai'],
    'Ibama': ['Ibama', 'Rivers', 'Tai'],
    'Ikwerre': ['Ikwerre', 'Rivers', 'Obio Akpor'],
    'Ison': ['Ison', 'Rivers', 'Ahoada East'],
    'Jema': ['Jema', 'Rivers', 'Ahoada East'],
    'Kalabari': ['Kalabari', 'Rivers', 'Opobo Nkoro'],
    'Khana': ['Khana', 'Rivers', 'Ogoni'],
    'Komo': ['Komo', 'Rivers', 'Ogoni'],
    'Obio Akpor': ['Obio Akpor', 'Rivers', 'Port Harcourt'],
    'Ogoni': ['Ogoni', 'Rivers', 'Tai'],
    'Opobo Nkoro': ['Opobo Nkoro', 'Rivers', 'Bonny'],
    'Oyigbo': ['Oyigbo', 'Rivers', 'Etche'],
    'Port Harcourt': ['Port Harcourt', 'Rivers', 'Obio Akpor'],
    'Tai': ['Tai', 'Rivers', 'Eleme'],
  },
  'Sokoto': {
    'Binji': ['Binji', 'Sokoto', 'Bodinga'],
    'Bodinga': ['Bodinga', 'Sokoto', 'Binji'],
    'Dange-Shinari': ['Dange-Shinari', 'Sokoto', 'Tangaza'],
    'Gada': ['Gada', 'Sokoto', 'Bodinga'],
    'Gawabawa': ['Gawabawa', 'Sokoto', 'Yabo'],
    'Goronyo': ['Goronyo', 'Sokoto', 'Gawon Nama'],
    'Illela': ['Illela', 'Sokoto', 'Tangaza'],
    'Isa': ['Isa', 'Sokoto', 'Goronyo'],
    'Kebbe': ['Kebbe', 'Sokoto', 'Binji'],
    'Kware': ['Kware', 'Sokoto', 'Sokoto North'],
    'Rabah': ['Rabah', 'Sokoto', 'Dange-Shinari'],
    'Sabon Birni': ['Sabon Birni', 'Sokoto', 'Isa'],
    'Sokoto North': ['Sokoto North', 'Sokoto', 'Sokoto South'],
    'Sokoto South': ['Sokoto South', 'Sokoto', 'Sokoto North'],
    'Tambuwal': ['Tambuwal', 'Sokoto', 'Kware'],
    'Tangaza': ['Tangaza', 'Sokoto', 'Dange-Shinari'],
    'Tureta': ['Tureta', 'Sokoto', 'Sabon Birni'],
    'Yabo': ['Yabo', 'Sokoto', 'Gawabawa'],
    'Yagba': ['Yagba', 'Sokoto', 'Yabo'],
  },
  'Taraba': {
    'Ardo Kola': ['Ardo Kola', 'Taraba', 'Gashaka'],
    'Bali': ['Bali', 'Taraba', 'Gashaka'],
    'Donga': ['Donga', 'Taraba', 'Gashaka'],
    'Gashaka': ['Gashaka', 'Taraba', 'Bali'],
    'Gassol': ['Gassol', 'Taraba', 'Lau'],
    'Ibi': ['Ibi', 'Taraba', 'Wukari'],
    'Ising': ['Ising', 'Taraba', 'Lau'],
    'Jalingo': ['Jalingo', 'Taraba', 'Lau'],
    'Karim Lamido': ['Karim Lamido', 'Taraba', 'Gashaka'],
    'Kurmi': ['Kurmi', 'Taraba', 'Lau'],
    'Lau': ['Lau', 'Taraba', 'Kurmi'],
    'Sardauna': ['Sardauna', 'Taraba', 'Gashaka'],
    'Takum': ['Takum', 'Taraba', 'Wukari'],
    'Ussa': ['Ussa', 'Taraba', 'Lau'],
    'Wukari': ['Wukari', 'Taraba', 'Ibi'],
  },
  'Yobe': {
    'Bade': ['Bade', 'Yobe', 'Geidam'],
    'Bursari': ['Bursari', 'Yobe', 'Geidam'],
    'Damaturu': ['Damaturu', 'Yobe', 'Borno'],
    'Fune': ['Fune', 'Yobe', 'Geidam'],
    'Geidam': ['Geidam', 'Yobe', 'Bade'],
    'Gujba': ['Gujba', 'Yobe', 'Damaturu'],
    'Guyuk': ['Guyuk', 'Yobe', 'Damaturu'],
    'Jakusko': ['Jakusko', 'Yobe', 'Gujba'],
    'Karasuwa': ['Karasuwa', 'Yobe', 'Bade'],
    'Karewa': ['Karewa', 'Yobe', 'Karasuwa'],
    'Kubar': ['Kubar', 'Yobe', 'Bursari'],
    'Machina': ['Machina', 'Yobe', 'Karasuwa'],
    'Mai Adua': ['Mai Adua', 'Yobe', 'Fune'],
    'Nangere': ['Nangere', 'Yobe', 'Bade'],
    'Nguru': ['Nguru', 'Yobe', 'Gujba'],
    'Potiskum': ['Potiskum', 'Yobe', 'Gujba'],
    'Sahare': ['Sahare', 'Yobe', 'Bade'],
    'Sakarai': ['Sakarai', 'Yobe', 'Bursari'],
    'Yunusari': ['Yunusari', 'Yobe', 'Bade'],
    'Yusufari': ['Yusufari', 'Yobe', 'Karasuwa'],
  },
  'Zamfara': {
    'Anka': ['Anka', 'Zamfara', 'Maru'],
    'Bakura': ['Bakura', 'Zamfara', 'Anka'],
    'Birnin Magaji': ['Birnin Magaji', 'Zamfara', 'Jigawa'],
    'Bukkuyum': ['Bukkuyum', 'Zamfara', 'Maru'],
    'Bungudu': ['Bungudu', 'Zamfara', 'Maru'],
    'Charanchi': ['Charanchi', 'Zamfara', 'Kaura Namoda'],
    'Chafe': ['Chafe', 'Zamfara', 'Talata Mafara'],
    'Dandume': ['Dandume', 'Zamfara', 'Talata Mafara'],
    'Dera': ['Dera', 'Zamfara', 'Kaura Namoda'],
    'Dukku': ['Dukku', 'Zamfara', 'Gummi'],
    'Fada': ['Fada', 'Zamfara', 'Gusau'],
    'Gada': ['Gada', 'Zamfara', 'Maru'],
    'Gummi': ['Gummi', 'Zamfara', 'Dukku'],
    'Gusau': ['Gusau', 'Zamfara', 'Fada'],
    'Jigawa': ['Jigawa', 'Zamfara', 'Birnin Magaji'],
    'Kaura Namoda': ['Kaura Namoda', 'Kano', 'Zamfara'],
    'Kazaure': ['Kazaure', 'Zamfara', 'Kaura Namoda'],
    'Kiyawa': ['Kiyawa', 'Zamfara', 'Jigawa'],
    'Kontagora': ['Kontagora', 'Niger', 'Zamfara'],
    'Maradun': ['Maradun', 'Zamfara', 'Talata Mafara'],
    'Maru': ['Maru', 'Zamfara', 'Anka'],
    'Shinkafi': ['Shinkafi', 'Zamfara', 'Talata Mafara'],
    'Silame': ['Silame', 'Zamfara', 'Gusau'],
    'Talata Mafara': ['Talata Mafara', 'Zamfara', 'Dandum'],
    'Taura': ['Taura', 'Jigawa', 'Zamfara'],
    'Tsafe': ['Tsafe', 'Zamfara', 'Talata Mafara'],
    'Zurmi': ['Zurmi', 'Zamfara', 'Maru'],
  },
  'Federal Capital Territory': {
    'Abuja': ['Abuja', 'Abuja Municipal', 'Gwagwalada'],
    'Abuja Municipal': ['Abuja', 'Abuja', 'Gwagwalada'],
    'Bwari': ['Bwari', 'FCT', 'Abuja'],
    'Gwagwalada': ['Gwagwalada', 'FCT', 'Abuja'],
    'Kuje': ['Kuje', 'FCT', 'Gwagwalada'],
    'Kwali': ['Kwali', 'FCT', 'Kuje'],
  },
}

interface LocationInputProps {
  value: {
    city: string
    lga: string
    state: string
    country: string
  }
  onChange: (location: {
    city: string
    lga: string
    state: string
    country: string
  }) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [openDropdown, setOpenDropdown] = useState<'state' | 'lga' | 'city' | null>(null)

  const states = Object.keys(nigerianLocations).sort()
  const lgas = value.state ? Object.keys(nigerianLocations[value.state] || {}).sort() : []
  const cities = value.state && value.lga 
    ? (nigerianLocations[value.state]?.[value.lga] || []).sort()
    : []

  const locationText = [value.city, value.lga, value.state, 'Nigeria'].filter(Boolean).join(', ')

  const handleStateSelect = (state: string) => {
    onChange({
      country: 'Nigeria',
      state,
      lga: '',
      city: '',
    })
    setOpenDropdown('lga')
  }

  const handleLgaSelect = (lga: string) => {
    onChange({
      ...value,
      lga,
      city: '',
    })
    setOpenDropdown('city')
  }

  const handleCitySelect = (city: string) => {
    onChange({
      ...value,
      city,
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

        {/* City Dropdown */}
        {openDropdown === 'city' && value.state && value.lga && (
          <div className="border border-border rounded-2xl p-3 space-y-2 bg-secondary/30 max-h-64 overflow-y-auto">
            <label className="text-xs font-semibold text-muted-foreground px-1 sticky top-0">SELECT CITY / TOWN</label>
            <div className="space-y-1">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    value.city === city
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface LocationInputProps {
  value: {
    city: string
    lga: string
    state: string
    country: string
  }
  onChange: (location: {
    city: string
    lga: string
    state: string
    country: string
  }) => void
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [openDropdown, setOpenDropdown] = useState<'country' | 'state' | 'lga' | 'city' | null>(null)

  const countries = Object.keys(locationData)
  const states = value.country ? Object.keys(locationData[value.country as keyof typeof locationData] || {}) : []
  const lgas = value.country && value.state 
    ? Object.keys((locationData[value.country as keyof typeof locationData]?.[value.state as keyof typeof locationData[keyof typeof locationData]] || {}) as Record<string, string[]>)
    : []
  const cities = value.country && value.state && value.lga
    ? ((locationData[value.country as keyof typeof locationData]?.[value.state as keyof typeof locationData[keyof typeof locationData]] || {})[value.lga as keyof typeof locationData[keyof typeof locationData][keyof typeof locationData[keyof typeof locationData]]] || []) as string[]
    : []

  const locationText = `${value.city}${value.city && value.lga ? ', ' : ''}${value.lga}${(value.city || value.lga) && value.state ? ', ' : ''}${value.state}${(value.city || value.lga || value.state) && value.country ? ', ' : ''}${value.country}`
    .replace(/^, |, $|, , /g, ', ')
    .replace(/^, |, $/g, '')

  const handleCountrySelect = (country: string) => {
    onChange({
      country,
      state: '',
      lga: '',
      city: '',
    })
    setOpenDropdown('state')
  }

  const handleStateSelect = (state: string) => {
    onChange({
      ...value,
      state,
      lga: '',
      city: '',
    })
    setOpenDropdown('lga')
  }

  const handleLgaSelect = (lga: string) => {
    onChange({
      ...value,
      lga,
      city: '',
    })
    setOpenDropdown('city')
  }

  const handleCitySelect = (city: string) => {
    onChange({
      ...value,
      city,
    })
    setOpenDropdown(null)
  }

  return (
    <div>
      <h3 className="font-medium mb-3">Location</h3>
      <div className="space-y-3">
        {/* Display Button */}
        <button
          onClick={() => setOpenDropdown(openDropdown ? null : 'country')}
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

        {/* Cascading Dropdowns */}
        {openDropdown && (
          <div className="border border-border rounded-2xl p-4 space-y-3 bg-secondary/30">
            {/* Country Dropdown */}
            {openDropdown === 'country' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">SELECT COUNTRY</label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.country === country
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* State Dropdown */}
            {openDropdown === 'state' && value.country && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  SELECT STATE
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
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
            {openDropdown === 'lga' && value.country && value.state && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  SELECT LGA
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
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

            {/* City Dropdown */}
            {openDropdown === 'city' && value.country && value.state && value.lga && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  SELECT CITY / TOWN
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        value.city === city
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Info */}
            {openDropdown && (
              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                {openDropdown === 'country' && 'Select a country to continue'}
                {openDropdown === 'state' && value.country && `Select a state in ${value.country}`}
                {openDropdown === 'lga' && value.state && `Select an LGA in ${value.state}`}
                {openDropdown === 'city' && value.lga && `Select a city in ${value.lga}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
