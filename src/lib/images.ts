import type { ImgKey } from '../data/catalog'
import bcaa from '../assets/img/bcaa.jpg'
import certs from '../assets/img/certs.jpg'
import concentrate from '../assets/img/concentrate.jpg'
import creatine from '../assets/img/creatine.jpg'
import eaa from '../assets/img/eaa.jpg'
import factory from '../assets/img/factory.jpg'
import fatburner from '../assets/img/fatburner.jpg'
import gainer from '../assets/img/gainer.jpg'
import isolate from '../assets/img/isolate.jpg'
import lineup from '../assets/img/lineup.webp'
import logo from '../assets/img/logo.jpg'
import mocha from '../assets/img/mocha.jpg'
import peanut from '../assets/img/peanut.jpg'
import plant from '../assets/img/plant.jpg'
import tea from '../assets/img/tea.jpg'
import whey60 from '../assets/img/whey60.jpg'
import yeast from '../assets/img/yeast.jpg'

import fdaLogo from '../assets/img/certs/fda.webp'
import fssaiLogo from '../assets/img/certs/fssai.webp'
import gmpLogo from '../assets/img/certs/gmp.webp'
import haccpLogo from '../assets/img/certs/haccp.webp'
import halalLogo from '../assets/img/certs/halal.webp'
import kosherLogo from '../assets/img/certs/kosher.webp'

export const IMG: Record<ImgKey, string> = { isolate, lineup, plant, whey60, bcaa, creatine, logo, eaa, yeast, gainer, concentrate, fatburner, tea, peanut, mocha, factory, certs }

/* Certification logos: the same transparent files gomzilifesciences.in uses
   (/assets/images/third-party-manufacturing/), in the same order */
export const CERT_LOGOS = [
	{ src: fssaiLogo, name: 'FSSAI' },
	{ src: gmpLogo, name: 'GMP' },
	{ src: haccpLogo, name: 'HACCP' },
	{ src: halalLogo, name: 'Halal' },
	{ src: kosherLogo, name: 'Kosher' },
	{ src: fdaLogo, name: 'FDA' },
]
