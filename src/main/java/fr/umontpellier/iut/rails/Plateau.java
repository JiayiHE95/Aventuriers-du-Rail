package fr.umontpellier.iut.rails;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Plateau {
    /**
     * Liste des villes
     */
    private final List<Ville> villes;
    /**
     * Liste des routes
     */
    private final List<Route> routes;

    public Plateau(List<Ville> villes, List<Route> routes) {
        this.villes = villes;
        this.routes = routes;
    }

    public List<Ville> getVilles() {
        return villes;
    }

    public List<Route> getRoutes() {
        return routes;
    }

    static public Plateau makePlateauEurope() {
        Map<String, Ville> villes = new HashMap<>();
        villes.put("amsterdam", new Ville("Amsterdam"));
        villes.put("angora", new Ville("Angora"));
        villes.put("athina", new Ville("Athina"));
        villes.put("barcelona", new Ville("Barcelona"));
        villes.put("berlin", new Ville("Berlin"));
        villes.put("brest", new Ville("Brest"));
        villes.put("brindisi", new Ville("Brindisi"));
        villes.put("bruxelles", new Ville("Bruxelles"));
        villes.put("bucuresti", new Ville("Bucuresti"));
        villes.put("budapest", new Ville("Budapest"));
        villes.put("cadiz", new Ville("Cadiz"));
        villes.put("constantinople", new Ville("Constantinople"));
        villes.put("danzig", new Ville("Danzig"));
        villes.put("dieppe", new Ville("Dieppe"));
        villes.put("edinburgh", new Ville("Edinburgh"));
        villes.put("erzurum", new Ville("Erzurum"));
        villes.put("essen", new Ville("Essen"));
        villes.put("frankfurt", new Ville("Frankfurt"));
        villes.put("kharkov", new Ville("Kharkov"));
        villes.put("kobenhavn", new Ville("Kobenhavn"));
        villes.put("kyiv", new Ville("Kyiv"));
        villes.put("lisboa", new Ville("Lisboa"));
        villes.put("london", new Ville("London"));
        villes.put("madrid", new Ville("Madrid"));
        villes.put("marseille", new Ville("Marseille"));
        villes.put("moskva", new Ville("Moskva"));
        villes.put("munchen", new Ville("Munchen"));
        villes.put("palermo", new Ville("Palermo"));
        villes.put("pamplona", new Ville("Pamplona"));
        villes.put("paris", new Ville("Paris"));
        villes.put("petrograd", new Ville("Petrograd"));
        villes.put("riga", new Ville("Riga"));
        villes.put("roma", new Ville("Roma"));
        villes.put("rostov", new Ville("Rostov"));
        villes.put("sarajevo", new Ville("Sarajevo"));
        villes.put("sevastopol", new Ville("Sevastopol"));
        villes.put("smolensk", new Ville("Smolensk"));
        villes.put("smyrna", new Ville("Smyrna"));
        villes.put("sochi", new Ville("Sochi"));
        villes.put("sofia", new Ville("Sofia"));
        villes.put("stockholm", new Ville("Stockholm"));
        villes.put("venezia", new Ville("Venezia"));
        villes.put("warszawa", new Ville("Warszawa"));
        villes.put("wien", new Ville("Wien"));
        villes.put("wilno", new Ville("Wilno"));
        villes.put("zagrab", new Ville("Zagrab"));
        villes.put("zurich", new Ville("Zurich"));

        ArrayList<Route> routes = new ArrayList<>();
        routes.add(new Route(villes.get("amsterdam"), villes.get("bruxelles"), 1, CouleurWagon.NOIR));
        routes.add(new Route(villes.get("amsterdam"), villes.get("essen"), 3, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("amsterdam"), villes.get("frankfurt"), 2, CouleurWagon.BLANC));
        routes.add(new Ferry(villes.get("amsterdam"), villes.get("london"), 2, CouleurWagon.GRIS, 2));
        routes.add(new Tunnel(villes.get("angora"), villes.get("constantinople"), 2, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("angora"), villes.get("erzurum"), 3, CouleurWagon.NOIR));
        routes.add(new Tunnel(villes.get("angora"), villes.get("smyrna"), 3, CouleurWagon.ORANGE));
        routes.add(new Ferry(villes.get("athina"), villes.get("brindisi"), 4, CouleurWagon.GRIS, 1));
        routes.add(new Route(villes.get("athina"), villes.get("sarajevo"), 4, CouleurWagon.VERT));
        routes.add(new Ferry(villes.get("athina"), villes.get("smyrna"), 2, CouleurWagon.GRIS, 1));
        routes.add(new Route(villes.get("athina"), villes.get("sofia"), 3, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("barcelona"), villes.get("madrid"), 2, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("barcelona"), villes.get("marseille"), 4, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("barcelona"), villes.get("pamplona"), 2, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("berlin"), villes.get("danzig"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("berlin"), villes.get("essen"), 2, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("berlin"), villes.get("frankfurt"), 3, CouleurWagon.ROUGE));
        routes.add(new Route(villes.get("berlin"), villes.get("frankfurt"), 3, CouleurWagon.NOIR));
        routes.add(new Route(villes.get("berlin"), villes.get("warszawa"), 4, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("berlin"), villes.get("warszawa"), 4, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("berlin"), villes.get("wien"), 3, CouleurWagon.VERT));
        routes.add(new Route(villes.get("brest"), villes.get("dieppe"), 2, CouleurWagon.ORANGE));
        routes.add(new Route(villes.get("brest"), villes.get("pamplona"), 4, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("brest"), villes.get("paris"), 3, CouleurWagon.NOIR));
        routes.add(new Ferry(villes.get("brindisi"), villes.get("palermo"), 3, CouleurWagon.GRIS, 1));
        routes.add(new Route(villes.get("brindisi"), villes.get("roma"), 2, CouleurWagon.BLANC));
        routes.add(new Route(villes.get("bruxelles"), villes.get("dieppe"), 2, CouleurWagon.VERT));
        routes.add(new Route(villes.get("bruxelles"), villes.get("frankfurt"), 2, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("bruxelles"), villes.get("paris"), 2, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("bruxelles"), villes.get("paris"), 2, CouleurWagon.ROUGE));
        routes.add(new Tunnel(villes.get("bucuresti"), villes.get("budapest"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("bucuresti"), villes.get("constantinople"), 3, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("bucuresti"), villes.get("kyiv"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("bucuresti"), villes.get("sevastopol"), 4, CouleurWagon.BLANC));
        routes.add(new Tunnel(villes.get("bucuresti"), villes.get("sofia"), 2, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("budapest"), villes.get("kyiv"), 6, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("budapest"), villes.get("sarajevo"), 3, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("budapest"), villes.get("wien"), 1, CouleurWagon.ROUGE));
        routes.add(new Route(villes.get("budapest"), villes.get("wien"), 1, CouleurWagon.BLANC));
        routes.add(new Route(villes.get("budapest"), villes.get("zagrab"), 2, CouleurWagon.ORANGE));
        routes.add(new Route(villes.get("cadiz"), villes.get("lisboa"), 2, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("cadiz"), villes.get("madrid"), 3, CouleurWagon.ORANGE));
        routes.add(new Ferry(villes.get("constantinople"), villes.get("sevastopol"), 4, CouleurWagon.GRIS, 2));
        routes.add(new Tunnel(villes.get("constantinople"), villes.get("smyrna"), 2, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("constantinople"), villes.get("sofia"), 3, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("danzig"), villes.get("riga"), 3, CouleurWagon.NOIR));
        routes.add(new Route(villes.get("danzig"), villes.get("warszawa"), 2, CouleurWagon.GRIS));
        routes.add(new Ferry(villes.get("dieppe"), villes.get("london"), 2, CouleurWagon.GRIS, 1));
        routes.add(new Ferry(villes.get("dieppe"), villes.get("london"), 2, CouleurWagon.GRIS, 1));
        routes.add(new Route(villes.get("dieppe"), villes.get("paris"), 1, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("edinburgh"), villes.get("london"), 4, CouleurWagon.ORANGE));
        routes.add(new Route(villes.get("edinburgh"), villes.get("london"), 4, CouleurWagon.NOIR));
        routes.add(new Ferry(villes.get("erzurum"), villes.get("sevastopol"), 4, CouleurWagon.GRIS, 2));
        routes.add(new Tunnel(villes.get("erzurum"), villes.get("sochi"), 3, CouleurWagon.ROUGE));
        routes.add(new Route(villes.get("essen"), villes.get("frankfurt"), 2, CouleurWagon.VERT));
        routes.add(new Ferry(villes.get("essen"), villes.get("kobenhavn"), 3, CouleurWagon.GRIS, 1));
        routes.add(new Ferry(villes.get("essen"), villes.get("kobenhavn"), 3, CouleurWagon.GRIS, 1));
        routes.add(new Route(villes.get("frankfurt"), villes.get("munchen"), 2, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("frankfurt"), villes.get("paris"), 3, CouleurWagon.ORANGE));
        routes.add(new Route(villes.get("frankfurt"), villes.get("paris"), 3, CouleurWagon.BLANC));
        routes.add(new Route(villes.get("kharkov"), villes.get("kyiv"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("kharkov"), villes.get("moskva"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("kharkov"), villes.get("rostov"), 2, CouleurWagon.VERT));
        routes.add(new Route(villes.get("kobenhavn"), villes.get("stockholm"), 3, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("kobenhavn"), villes.get("stockholm"), 3, CouleurWagon.BLANC));
        routes.add(new Route(villes.get("kyiv"), villes.get("smolensk"), 3, CouleurWagon.ROUGE));
        routes.add(new Route(villes.get("kyiv"), villes.get("warszawa"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("kyiv"), villes.get("wilno"), 2, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("lisboa"), villes.get("madrid"), 3, CouleurWagon.ROSE));
        routes.add(new Tunnel(villes.get("madrid"), villes.get("pamplona"), 3, CouleurWagon.BLANC));
        routes.add(new Tunnel(villes.get("madrid"), villes.get("pamplona"), 3, CouleurWagon.NOIR));
        routes.add(new Route(villes.get("marseille"), villes.get("pamplona"), 4, CouleurWagon.ROUGE));
        routes.add(new Route(villes.get("marseille"), villes.get("paris"), 4, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("marseille"), villes.get("roma"), 4, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("marseille"), villes.get("zurich"), 2, CouleurWagon.ROSE));
        routes.add(new Route(villes.get("moskva"), villes.get("petrograd"), 4, CouleurWagon.BLANC));
        routes.add(new Route(villes.get("moskva"), villes.get("smolensk"), 2, CouleurWagon.ORANGE));
        routes.add(new Tunnel(villes.get("munchen"), villes.get("venezia"), 2, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("munchen"), villes.get("wien"), 3, CouleurWagon.ORANGE));
        routes.add(new Tunnel(villes.get("munchen"), villes.get("zurich"), 2, CouleurWagon.JAUNE));
        routes.add(new Ferry(villes.get("palermo"), villes.get("roma"), 4, CouleurWagon.GRIS, 1));
        routes.add(new Ferry(villes.get("palermo"), villes.get("smyrna"), 6, CouleurWagon.GRIS, 2));
        routes.add(new Route(villes.get("pamplona"), villes.get("paris"), 4, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("pamplona"), villes.get("paris"), 4, CouleurWagon.VERT));
        routes.add(new Tunnel(villes.get("paris"), villes.get("zurich"), 3, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("petrograd"), villes.get("riga"), 4, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("petrograd"), villes.get("stockholm"), 8, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("petrograd"), villes.get("wilno"), 4, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("riga"), villes.get("wilno"), 4, CouleurWagon.VERT));
        routes.add(new Route(villes.get("roma"), villes.get("venezia"), 2, CouleurWagon.NOIR));
        routes.add(new Route(villes.get("rostov"), villes.get("sevastopol"), 4, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("rostov"), villes.get("sochi"), 2, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("sarajevo"), villes.get("sofia"), 2, CouleurWagon.GRIS));
        routes.add(new Route(villes.get("sarajevo"), villes.get("zagrab"), 3, CouleurWagon.ROUGE));
        routes.add(new Ferry(villes.get("sevastopol"), villes.get("sochi"), 2, CouleurWagon.GRIS, 1));
        routes.add(new Route(villes.get("smolensk"), villes.get("wilno"), 3, CouleurWagon.JAUNE));
        routes.add(new Route(villes.get("venezia"), villes.get("zagrab"), 2, CouleurWagon.GRIS));
        routes.add(new Tunnel(villes.get("venezia"), villes.get("zurich"), 2, CouleurWagon.VERT));
        routes.add(new Route(villes.get("warszawa"), villes.get("wien"), 4, CouleurWagon.BLEU));
        routes.add(new Route(villes.get("warszawa"), villes.get("wilno"), 3, CouleurWagon.ROUGE));
        routes.add(new Route(villes.get("wien"), villes.get("zagrab"), 2, CouleurWagon.GRIS));

        // Correction du nom pour les routes doubles
        for (int i = 0; i < routes.size(); i++) {
            Route r1 = routes.get(i);
            if (i < routes.size() - 1) {
                Route r2 = routes.get(i + 1);
                if (r1.getNom().equals(r2.getNom())) {
                    r1.setNom(r1.getNom() + "(1)");
                    r2.setNom(r2.getNom() + "(2)");
                }
            }
        }
        return new Plateau(new ArrayList<>(villes.values()), routes);
    }
}
