cities = [
    "Amsterdam",
    "Angora",
    "Athina",
    "Barcelona",
    "Berlin",
    "Brest",
    "Brindisi",
    "Bruxelles",
    "Bucuresti",
    "Budapest",
    "Cadiz",
    "Constantinople",
    "Danzig",
    "Dieppe",
    "Edinburgh",
    "Erzurum",
    "Essen",
    "Frankfurt",
    "Kharkov",
    "København",
    "Kyiv",
    "Lisboa",
    "London",
    "Madrid",
    "Marseille",
    "Moskva",
    "München",
    "Palermo",
    "Pamplona",
    "Paris",
    "Petrograd",
    "Riga",
    "Roma",
    "Rostov",
    "Sarajevo",
    "Sevastopol",
    "Smolensk",
    "Smyrna",
    "Sochi",
    "Sofia",
    "Stockholm",
    "Venezia",
    "Warszawa",
    "Wien",
    "Wilno",
    "Zagrab",
    "Zürich",
]

GRIS = "GRIS"
NOIR = "NOIR"
BLANC = "BLANC"
JAUNE = "JAUNE"
ROUGE = "ROUGE"
ORANGE = "ORANGE"
BLEU = "BLEU"
VERT = "VERT"
ROSE = "ROSE"
LOCOMOTIVE = "LOCOMOTIVE"

amsterdam = "amsterdam"
angora = "angora"
athina = "athina"
barcelona = "barcelona"
berlin = "berlin"
brest = "brest"
brindisi = "brindisi"
bruxelles = "bruxelles"
bucuresti = "bucuresti"
budapest = "budapest"
cadiz = "cadiz"
constantinople = "constantinople"
danzig = "danzig"
dieppe = "dieppe"
edinburgh = "edinburgh"
erzurum = "erzurum"
essen = "essen"
frankfurt = "frankfurt"
kharkov = "kharkov"
kobenhavn = "kobenhavn"
kyiv = "kyiv"
lisboa = "lisboa"
london = "london"
madrid = "madrid"
marseille = "marseille"
moskva = "moskva"
munchen = "munchen"
palermo = "palermo"
pamplona = "pamplona"
paris = "paris"
petrograd = "petrograd"
riga = "riga"
roma = "roma"
rostov = "rostov"
sarajevo = "sarajevo"
sevastopol = "sevastopol"
smolensk = "smolensk"
smyrna = "smyrna"
sochi = "sochi"
sofia = "sofia"
stockholm = "stockholm"
venezia = "venezia"
warszawa = "warszawa"
wien = "wien"
wilno = "wilno"
zagrab = "zagrab"
zurich = "zurich"

routes = [
    (edinburgh, london, 4, NOIR),
    (edinburgh, london, 4, ORANGE),
    (london, amsterdam, 2, GRIS, 2),
    (london, dieppe, 2, GRIS, 1),
    (london, dieppe, 2, GRIS, 1),
    (dieppe, brest, 2, ORANGE),
    (dieppe, bruxelles, 2, VERT),
    (dieppe, paris, 1, ROSE),
    (brest, paris, 3, NOIR),
    (brest, pamplona, 4, ROSE),
    (paris, pamplona, 4, BLEU),
    (paris, pamplona, 4, VERT),
    (paris, marseille, 4, GRIS),
    (paris, zurich, 3, GRIS, True),
    (paris, frankfurt, 3, BLANC),
    (paris, frankfurt, 3, ORANGE),
    (paris, bruxelles, 2, JAUNE),
    (paris, bruxelles, 2, ROUGE),
    (pamplona, madrid, 3, BLANC),
    (pamplona, madrid, 3, NOIR),
    (pamplona, barcelona, 2, GRIS, True),
    (pamplona, marseille, 4, ROUGE),
    (madrid, lisboa, 3, ROSE),
    (madrid, cadiz, 3, ORANGE),
    (madrid, barcelona, 2, JAUNE),
    (lisboa, cadiz, 2, BLEU),
    (barcelona, marseille, 4, GRIS),
    (zurich, marseille, 2, ROSE, True),
    (zurich, munchen, 2, JAUNE, True),
    (zurich, venezia, 2, VERT, True),
    (marseille, roma, 4, GRIS, True),
    (munchen, venezia, 2, BLEU, True),
    (munchen, frankfurt, 2, ROSE),
    (frankfurt, bruxelles, 2, BLEU),
    (frankfurt, amsterdam, 2, BLANC),
    (bruxelles, amsterdam, 1, NOIR),
    (venezia, roma, 2, NOIR),
]

var_names = []
for city_name in cities:
    tr = str.maketrans("øü", "ou")
    var_name = city_name.lower().translate(tr)
    var_names.append(var_name)
    print(f'Ville {var_name} = new Ville("{city_name}");')

# for var_name in var_names:
#     print(f'{var_name} = "{var_name}"')

for route in routes:
    ville1, ville2, longueur, couleur = route[:4]
    locomotives = 0
    tunnel = False
    if len(route) == 5:
        if route[4] is True:
            tunnel = True
        else:
            locomotives = route[4]
    if tunnel:
        print(f'routes.add(new Tunnel({ville1}, {ville2}, {longueur}, Couleur.{couleur}));')
    else:
        print(f'routes.add(new Route({ville1}, {ville2}, {longueur}, Couleur.{couleur}, {locomotives}));')


# print(f'Ville[] villes = new Ville[] {{{", ".join(var_names)}}};')
