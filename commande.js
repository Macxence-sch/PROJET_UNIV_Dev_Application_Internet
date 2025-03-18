'use strict';

window.addEventListener('load',go);

// SAM Design Pattern : http://sam.js.org/
let samActions, samModel, samState, samView;

function go() {
  console.info('Go!');
  
  samActions.exec({do:'init', artiPart1:artiPart1Data, artiPart2:artiPart2Data});
  
  // pour un nombre de lignes pleines d'articles quelque soit la largeur du navigateur
  window.addEventListener('resize', () => {samActions.exec({do:'updatePagination'})});
}

//----------------------------------------------------------------- Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//

samActions = {
  
  exec(data) {
    let enableAnimation = true; // pour les animations sur l'interface graphique
    let proposal;
    switch (data.do) {
      case 'init': {
        console.log('samActions.init');
        proposal = {do:data.do, artiPart1:data.artiPart1, artiPart2:data.artiPart2};
        enableAnimation = false;
      } break; 
      
    
      //Fonctionalité du site 
      case 'updatePagination'  : proposal = data; break;
      case 'darkThemeToggle'   : proposal = data; break;
      case 'animationsToggle'  : proposal = data; break;
      case 'ChangementPage'    : proposal = data; break;
      case 'ChangementLigne'   : proposal = data; break;

      //Caddie 
      case 'viewCartToggle'    : proposal = data; break;
      case 'toggleInCart'      : proposal = data; break;
      case 'cartDelete'        : proposal = data; break;
      case 'AddCart'           : proposal = data; break;
      case 'EditCart'          : proposal = data; break;
      case 'PrixCaddieTrie'      : proposal = data; break;
      case 'NomCaddieTrie'       : proposal = data; break;
      case 'QuantiterCaddieTrie' : proposal = data; break;

      //Arcticles 
      case 'gridListView'      : proposal = data; break;
      case 'imagesToggle'      : proposal = data; break;

      //Filtres
      case 'filterToggle'      : proposal = data; break;
      case 'Recherchetoogle'   : proposal = data; break;
      case 'Updatesearch'      : proposal = data; break;
      case 'FiltreSupression'  : proposal = data; break;
      case 'LeTOUT'            : proposal = data; break;


      default : 
        console.error('samActions - Action non prise en compte : ', data);
        return;
    }
    if (enableAnimation && samModel.model.settings.animations)
      setTimeout(()=>samModel.samPresent(proposal), 200);
    else             samModel.samPresent(proposal);
  },

};
//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//


const initialModel= {
  authors  : ['Schneider Macxence', 'Pere-Tastet Hadrien'],
  
  artiPart1: [],
  artiPart2: [],
  articles : {
    values : [],
    hasChanged : true,
  },
  categories: [],
  origins   : [],
  
  filters: {
    categories:{
      booleans: {}, // filtre actif ou non pour chaque catégorie
      count   : {}, // nombre d'articles de chaque catégorie
    },
    origins:{
      booleans: {},
      count   : {},
    },
    search : {
      global: false, // recherche sur tous les articles ou seulement les articles filtrés
      text  : 'Batton',   // texte recherché
    },
  },
  settings : {
    articleImages: true,
    animations   : true,
    darkTheme    : false,
  },
  display : {
    cartView     : true,   // panier visible ou non
    articlesView : 'grid', // affichage en 'grid' ou 'list'
  },
  pagination: {
    grid: {
      currentPage : 1,
      linesPerPage: 1,
      linesPerPageOptions: [1,2,3],
    },
    list: {
      currentPage : 1,
      linesPerPage: 3,
      linesPerPageOptions : [3,6,9],
    },
  },
  
  cartSort : {
    property  : 'name',   // tri du panier selon cette propriété
    ascending : {         // ordre du tri pour chaque propriété
      name    : true,
      quantity: true,
      total   : true,
    },  
    hasChanged: true,
  },  
};

samModel = {

  model: initialModel,

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data désignent la modification à faire sur le modèle.
  samPresent(data) {
    switch (data.do) {
      case 'init': {
        console.log('samModel.init');
        // this.model.artiPart1 = data.artiPart1;
        // this.model.artiPart2 = data.artiPart2;
        this.modelAssign('artiPart1', data.artiPart1);
        this.modelAssign('artiPart2', data.artiPart2);
        this.createArticles();
        this.extractCategories();
        this.extractOrigins();
      } break;
      

      case 'filterToggle'      : this.modelToggle(`filters.${data.util}.booleans.${data.use}`); break;
      case 'viewCartToggle'    : this.modelToggle('display.cartView');       break;
      case 'imagesToggle'      : this.modelToggle('settings.articleImages'); break;
      case 'animationsToggle'  : this.modelToggle('settings.animations'   ); break;
      case 'darkThemeToggle'   : this.modelToggle('settings.darkTheme'    ); break;      
      case 'gridListView'      : this.modelAssign('display.articlesView', data.view); break;        
      case 'Recherchetoogle'   : this.modelToggle('filters.search.global'); break; 
      case 'updatePagination'  : break;      
      
      
      case 'Updatesearch'      : 
        this.model.filters.search.text = data.valeur; 
        break;
      
      case 'FiltreSupression'  : 
        this.model.filters.search.text = ''; 
        break;

      case 'ChangementPage'    : 
        this.model.pagination[data.util].currentPage = data.page; 
        break;

      case 'ChangementLigne'   : 
        this.model.pagination[data.util].linesPerPage = data.valeur; 
        break;

      case 'toggleInCart'      : 
        const Arct = this.model.articles.values.find(act => act.id == data.id); 
        Arct.check = !Arct.check; 
        this.model.articles.hasChanged = true; 
        break;

      case 'cartDelete'        : 
      console.log("relou",data);
      this.model.articles.values.forEach(act => {
        if (act.check) {
          act.inCart = false;
          act.quantity = '';
        }
        }); 
        this.model.articles.hasChanged = true; 
        break;

      case 'AddCart'           : 
        let Arctt = this.model.articles.values.find(act => act.id == data.id); 
        Arctt.inCart = true ; 
        this.model.articles.hasChanged = true; 
        break;

      case 'EditCart'          : 
        console.log("sheeeeesh",data);
        let Arcttt = this.model.articles.values.find(act => act.id == data.id); 
        if (data.valeur == 0 || data.valeur === ''){
          Arcttt.inCart = false;
          Arcttt.quantity = '';
          this.model.articles.hasChanged = true;
          break;
        }
        !isNaN(data.valeur) && data.valeur !=='' ? Arcttt.quantity = data.valeur 
                                                                 : Arcttt.quantity = Arcttt.quantity; 
        this.model.articles.hasChanged = true; 
        break;

      case 'LeTOUT'            : 
        this.Toutoogle(data.bool,data.util);   // tu as capté le jeux de mot tout + toogle ça fait toutoogle
        break;

      case 'NomCaddieTrie'          : 
        this.model.cartSort.property = 'nom'; 
        this.modelToggle('cartSort.ascending.name'); 
        this.model.articles.hasChanged = true; 
        this.model.cartSort.hasChanged = true;
        break;

      case 'QuantiterCaddieTrie'      : 
        this.model.cartSort.property = 'quant'; 
        this.modelToggle('cartSort.ascending.quantity'); 
        this.model.articles.hasChanged = true;
        this.model.cartSort.hasChanged = true; 
        break;

      case 'PrixCaddieTrie'    :  
        console.log("frere il est chiant lui",data);
        this.model.cartSort.property = 'tot'; 
        this.modelToggle('cartSort.ascending.total'); 
        this.model.articles.hasChanged = true; 
        this.model.cartSort.hasChanged = true;
        break;

      default : 
        console.error('samPresent() - proposition non prise en compte : ', data);
        return;
    }

    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    samState.samUpdate(this.model);
    
    this.model.articles.hasChanged = false;
    this.model.cartSort.hasChanged = false;
  },

  Toutoogle(bool,filterName){
    const filtre = this.model.filters[filterName];
      Object.keys(filtre.booleans).forEach((key) => {
        filtre.booleans[key] = !bool;
    });
    filtre.hasChanged = true;
  },

  /**
   * Cadeau : Affecte value à la propriété propertyStr
   * 
   * modelToggle('display.cartView'); 
   * est équivalent à :
   * this.model.display.cartView = !this.model.display.cartView;
   * 
   * Intérêt : plus compact et un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si les types sont différents.
   *
   * @param {string} propertyStr 
   * @param {any}    value 
   */
   modelToggle(propertyStr) {
    const root = 'model';
    const path = propertyStr.split('.');
    let val = this[root];
    let pathNames = ['this',root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v]===undefined) {
        console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
        return true;
      }
      if (i < a.length - 1) { 
        val = val[v]; 
      } else {
        if (typeof val[v] != undefined && typeof val[v] != 'boolean') {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is not a boolean`);
          return true;
        };
        val[v] = !val[v];
      }
    });
  },
  /**
   * Cadeau : Transforme une propriété booléenne en son opposée (true -> false, false -> true)
   * 
   * this.modelAssign('artiPart1', data.artiPart1);
   * est équivalent à :
   * this.model.artiPart1 = data.artiPart1;
   *
   * Intérêt : un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si elle n'est pas de type booléen.
   *
   * @param {string} propertyStr 
   */
   modelAssign(propertyStr, value) {
    const root = 'model';
    const path = propertyStr.split('.');
    let val = this[root];
    let pathNames = ['this',root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v]===undefined) {
        console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
        return true;
      }
      if (i < a.length - 1) { 
        val = val[v]; 
      } else {
        if (typeof val[v] != undefined && typeof val[v] !== typeof value) {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} (${typeof val[v]}) is not of the same type of ${value} (${typeof value})`);
          return true;
        };
        val[v] = value;
      }
    });
  },
  
  /**
   * fonction à passer en paramete à Array.sort() pour trier un tableau d'objets
   * selon leur nom, et leur prix s'il ont le même nom.
   *
   * @param {Object} a 
   * @param {Object} b 
   * @returns -1 or 0 or 1
   */
  articlesSort(a,b) {
    if (a.name <b.name ) return -1;
    if (a.name >b.name ) return  1;
    if (a.price<b.price) return -1;
    if (a.price>b.price) return  1;
    return 0;  
    
  },
  
  /**
   * Création des articles à partir des deux fichiers de données (ArtiPart1 et ArtiPart2).
   *
   * Ce sont ces articles que l'interface graphique va représenter. 
   */
  createArticles() {
    const artiPart1 = this.model.artiPart1;
    const artiPart2 = this.model.artiPart2;
    
    let articleId = 0;
    
    const articles = artiPart1.map((a1)=>{
      
      const articlesTmp = artiPart2.filter((a) => a.id == a1.id).map((a2)=>{
        
        const article = {
          id      : articleId,  // création d'un identifiant unique pour chaque article
          // from artiPart2
          name    : a2.name,
          category: a2.category,
          pictures: a2.pictures,
          // from artiPart1
          origin  : a1.origin,
          price   : a1.price,
          unit    : a1.unit,
          quantity: a1.quantity,
          inCart  : a1.inCart,
        };
        articleId++;
        
        return article; 
      });
      return articlesTmp[0];
    });
    this.model.articles.values = articles.sort(this.articlesSort);  // articles triés
    this.model.articles.hasChanged = true;
    console.log('article :', this.model.articles);
  },
  
  /**
   * Pour un tri par ordre alphabétique
   * 
   */

    alphaSort(a, b) {
      return a.localeCompare(b, 'fr', { sensitivity: 'base' });
    },

  
  /**
   * Extraction :
   * - des catégories présentes dans la liste d'articles    --> model.categories
   * - du nombre d'articles appartenant à chaque catégories --> model.filters.categories.count
   *      model.filters.categories.count['fruits'] === 5
   * - du tableau de booléens pour l'état du filtre sur les catégories --> model.filters.categories.booleans
   *      model.filters.categories.booleans['fruits'] === true
   *
   * Les catégories sont triées par ordre alphabétique
   */
  extractCategories() {
    const articles   = this.model.articles.values;
    const categories = [];
    const catsCount  = {};
    const catsFilter = {};
    
    articles.forEach(article => {
      const category = article.category;
  
      if (catsCount[category]) {
        catsCount[category] = catsCount[category] + 1;
        console.log("test",catsCount[category]);
      } else {
        catsCount[category] = 1;
      }

      if (!categories.includes(category)) {
        categories.push(category);
        console.log("test2",categories);
      }
  
      catsFilter[category] = true; //init
    });
  
    //trie
    categories.sort(this.alphaSort);
    this.model.categories = categories;
    this.model.filters.categories.count  = catsCount;
    this.model.filters.categories.booleans = catsFilter;
  },
  
    extractOrigins() {
      const articles   = this.model.articles.values; 
      const origins    = [];
      const originsCount = {};
      const originsFilter = {};
    
      
      articles.forEach(article => {
        const origin = article.origin;
  
        if (!origins.includes(origin)) {
          origins.push(origin);
        }
    
        
        if (originsCount[origin]) {
          originsCount[origin] = originsCount[origin] +1 ;
        } else {
          originsCount[origin] = 1;
        }
    
        originsFilter[origin] = true;  //init
      });
    //trie
      origins.sort(this.alphaSort);
      this.model.origins = origins;
      this.model.filters.origins = {count: originsCount,booleans: originsFilter,};
    },
    
  };
//-------------------------------------------------------------------- State ---
// État de l'application avant affichage
//

const initialState = {

  filteredArticles : {    // articles filtrés
    values        : [],
    hasChanged    : true,
    representation: '',   // représentation pour ne pas avoir à la recalculer si n'a pas changé
  },
  
  filters : {
    categories : {
        booleans      : {},  // avec une propriété 'toutes' en plus qui vaut true si toutes les autres sont 'true'
        hasChanged    : true,
        representation: '',
    },
    origins : {
        booleans      : {},  // avec une propriété 'toutes' aussi
        hasChanged    : true,
        representation: '',
    },
    search : {
      global        : false,
      text          : '',
      hasChanged    : true,
      representation: '',
    },
  },
  display : {
    cartView: {
      value     : true,
      hasChanged: true,
      },
    articlesView : {
      value     : '',
      hasChanged: true,
      },
  },
  pagination: {  // Toutes ces valeurs sont calculées dans updatePagination()
    grid: {
      currentPage        : undefined,
      linesPerPage       : undefined,
      linesPerPageOptions: undefined,
      
      maxArticlesPerLine: undefined,
      numberOfPages     : undefined,
      hasPrevPage       : undefined,
      hasNextPage       : undefined,
    },
    list: {
      currentPage        : undefined,
      linesPerPage       : undefined,
      linesPerPageOptions: undefined,
      
      maxArticlesPerLine: undefined,
      numberOfPages     : undefined,
      hasPrevPage       : undefined,
      hasNextPage       : undefined,
    },
  },

  cart : {
    values: [],    // le panier rassemble tous les articles dont inCart==true
    total : 0,     // valeur totale du panier
    hasChanged: true,
    representation: '',
  },
  cartSort : {     // pour le tri des articles du panier
    property  : 'name',
    ascending : {
      name    : true,
      quantity: true,
      total   : true,
    },  
    hasChanged: true,
  },

};

samState = {

  state: initialState,

  samUpdate(model) {
    this.updateFilter    (model.filters.categories, this.state.filters.categories);
    this.updateFilter    (model.filters.origins,    this.state.filters.origins);
    this.updateSearch    (model.filters.search);
    this.filterArticles  (model.articles, this.state.filters);
    this.updateDisplay   (model.display);
    this.updatePagination(model.pagination);
    this.updateCartSort  (model.cartSort);
    this.updateCart      (model);
    
    this.samRepresent(model);
    
    // Nothing more to change
    this.state.filteredArticles.hasChanged     = false;
    this.state.filters.categories.hasChanged   = false;
    this.state.filters.origins.hasChanged      = false;
    this.state.filters.search.hasChanged       = false;
    this.state.display.cartView.hasChanged     = false;
    this.state.display.articlesView.hasChanged = false;
    this.state.cartSort.hasChanged             = false;
    this.state.cart.hasChanged                 = false;
  },
  
  /**
   * recopie les filtres du model dans le state
   * ajoute la propriété 'toutes' au tableau booleans
   */
  updateFilter(modelFilter, stateFilter) {
    console.log('updateFilter', modelFilter);
    console.log('updateFilter', stateFilter);
    stateFilter.booleans = modelFilter.booleans;
    stateFilter.toutes = Object.values(stateFilter.booleans).every((element)=> element == true);
    stateFilter.hasChanged = true;
    
  },
  
  updateSearch(modelSearch) {
    const stateSearch = this.state.filters.search;
    const globalHasChanged = modelSearch.global != stateSearch.global;
    const textHasChanged   = modelSearch.text   != stateSearch.text;
    stateSearch.hasChanged = globalHasChanged || textHasChanged;
    stateSearch.global     = modelSearch.global;
    stateSearch.text       = modelSearch.text;
  },

  filterArticles(articles, filters) {
    
    if (articles.hasChanged || 
      filters.categories.hasChanged || 
      filters.origins.hasChanged || 
      filters.search.hasChanged) {

      
      let filteredValues = articles.values;

      if(filters.search.global){
        if ((filters.search.text && filters.search.text.trim()) !== "") {    // trim pour espace 
          filteredValues = filteredValues.filter(cat => {
            let egal = true; 
              if (filters.search.text) {
                egal = cat.name.toLowerCase().includes(filters.search.text.toLowerCase());
              }
            return egal;});
        };

      }else{
          filteredValues = filteredValues.filter(cat => {const org = cat.origin;return filters.origins.booleans[org] ?? true; });
          filteredValues = filteredValues.filter(cat => {const catego = cat.category;return filters.categories.booleans[catego] ?? true; });

          if ((filters.search.text && filters.search.text.trim()) !== "") {
            filteredValues = filteredValues.filter(cat => {
              let egal = true; // Valeur par défaut
              if (filters.search.text) {
                egal = cat.name.toLowerCase().includes(filters.search.text.toLowerCase());
              }
              return egal;});
          };
        }
          
        
        //HADRIEN C'EST LA LE TRUC que je te parlais pendant le dernier cours, le prof ma aider pour ça 

      this.state.filteredArticles.values = filteredValues;
      this.state.filteredArticles.hasChanged = true;

      console.log("coucou",filteredValues);

    }
  },

  updateDisplay(display) {
    const cartView = this.state.display.cartView;
    if (cartView.value != display.cartView) {
      cartView.value = display.cartView;
      cartView.hasChanged = true;
    }
    const articlesView = this.state.display.articlesView;
    if (articlesView.value != display.articlesView) {
      articlesView.value = display.articlesView;
      articlesView.hasChanged = true;
    }
    
  },

  updatePagination(pagination) {
    const statePagination = this.state.pagination;
    
    const articleGrid        = document.getElementById('articleWidth');
    const articleWidth       = articleGrid.clientWidth;
    const minCardWidth       = 200;
    const articlesView       = this.state.display.articlesView.value;
    const maxArticlesPerLine = (articlesView == 'grid') ? Math.floor(articleWidth/minCardWidth) : 1;
    const linesPerPage       = pagination[articlesView].linesPerPage;
    const numberOfArticles   = this.state.filteredArticles.values.length;
    const numberOfPages      = Math.ceil(numberOfArticles / (maxArticlesPerLine * linesPerPage));
    
    statePagination[articlesView].currentPage         = pagination[articlesView].currentPage;
    statePagination[articlesView].linesPerPage        = linesPerPage;
    statePagination[articlesView].linesPerPageOptions = pagination[articlesView].linesPerPageOptions;
    statePagination[articlesView].maxArticlesPerLine  = maxArticlesPerLine;
    statePagination[articlesView].numberOfPages       = numberOfPages;
    statePagination[articlesView].hasPrevPage         = pagination[articlesView].currentPage > 1;
    statePagination[articlesView].hasNextPage         = pagination[articlesView].currentPage < numberOfPages;
  
    this.state.display.articlesView.hasChanged = true;
    
  },

  updateCartSort(cartSort) {
    if (cartSort.hasChanged) {
      this.state.cartSort.property   = cartSort.property;
      this.state.cartSort.ascending  = cartSort.ascending;
      this.state.cartSort.hasChanged = true;
    }
  },

  /**
   * Remplit le panier avec tous les articles dont inCart == true
   * et calcule le prix total du panier
   */
  updateCart(model) {
    console.log("UpdateCart",model);

    const articles = model.articles;

    if (articles.hasChanged) {
      model.articles.values.forEach((article) =>{article.check == undefined ? article.check = false : article.check })
      this.state.cart.values = []; 
      this.state.cart.total = 0;  
      articles.values.forEach(article => {
        if (article.inCart) {
            this.state.cart.values.push(article); 
            this.state.cart.total = this.state.cart.total + article.price * article.quantity; 
        }
    });



    const { cartSort, cart } = this.state;
    const { property, ascending } = cartSort;
    const sortValues = [...cart.values];

    if (property === 'quant') {
      sortValues.sort((a, b) => ascending['quantity'] ? a.quantity - b.quantity : b.quantity - a.quantity);
    } else if (property === 'nom') {
      sortValues.sort((a, b) => ascending['name'] ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (property === 'tot') {
      sortValues.sort((a, b) => ascending['total'] ? (a.price * a.quantity) - (b.price * b.quantity) : (b.price * b.quantity) - (a.price * a.quantity));
    }

    this.state.cart.values = sortValues;

    this.state.cart.hasChanged = true;
    console.log('updateCart' , this.state.cart.total,this.state.cart.values )
    }
  },  

  // Met à jour l'état de l'application, construit le code HTML correspondant,
  // et demande son affichage.
  samRepresent(model) {
    
    this.updateFilterUI(model, this.state, 'categories');
    this.updateFilterUI(model, this.state, 'origins');
    this.updateSearchUI(model, this.state);
    this.updateArticlesUI(model, this.state);
    this.updateCartUI(model, this.state);
    
    //Settings
    
    const representation = samView.mainUI(model, this.state);
    
    //Appel l'affichage du HTML généré.
    samView.samDisplay(representation);
  },

  updateFilterUI(model, state, filterName) {
    const filter = state.filters[filterName];
    if (filter.hasChanged) {
      filter.representation = samView.filterUI(model, state, filterName)
      filter.hasChanged = false;
    }
  },

  updateSearchUI(model, state) {
    const filter = state.filters.search;
    if (filter.hasChanged) {
      filter.representation = samView.searchUI(model, state);
      filter.hasChanged = false;
    }
  },

  updateArticlesUI(model, state) {
    const filteredArticles = state.filteredArticles;
    const articlesView     = state.display.articlesView;
    if (filteredArticles.hasChanged || articlesView.hasChanged) {
      filteredArticles.representation = articlesView.value == 'grid' ? samView.articlesGridUI(model, state) : samView.articlesListUI(model, state);
      filteredArticles.hasChanged = false;
      articlesView.hasChanged     = false;
    }
  },
  
  updateCartUI(model, state) {
    const cart     = state.cart;
    const cartView = state.display.cartView;
    const cartSort = state.cartSort;
    if (cart.hasChanged || cartView.hasChanged || cartSort.hasChanged) {
      cart.representation = samView.cartUI(model, state);      
      cart.hasChanged     = false;
      cartView.hasChanged = false;
      cartSort.hasChanged = false;
    }
  },

  updateThemeUI(model, state) {
    const settings = state.settings;
    if (settings.darkThemeHasChanged) {
      samView.darkThemeUI(state);
      settings.darkThemeHasChanged = false;
    }
  },

};
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
//////

samView = {

  // Injecte le HTML dans une balise de la page Web.
  samDisplay: function (representation) {
    const app = document.getElementById('app');
    app.innerHTML = representation;
  },

  // Astuce : Pour avoir la coloration syntaxique du HTML avec l'extension lit-html dans VSCode
  // https://marketplace.visualstudio.com/items?itemName=bierner.lit-html
  // utiliser this.html`<h1>Hello World</h1>` en remplacement de `<h1>Hello World</h1>`
  html([str, ...strs], ...vals) {
    return strs.reduce((acc,v,i)=> acc+vals[i]+v, str);
  },
 
  mainUI(model,state) {
    
    this.darkThemeUI(model);
    
    const cartClass = model.display.cartView ? 'border' : '';
    
    return this.html`
    <div class="row small-margin">
    <!-- ___________________________________________________________ Entête -->
    <div class="row middle-align no-margin">
      <div class="col s8 m9 l10">
        <h4 class="center-align"> Commande de fruits et légumes</h4>
      </div>
      <div class="col s4 m3 l2">
        <nav class="right-align small-margin">
          <button onclick="samActions.exec({do:'viewCartToggle'})" class="no-marin ${cartClass}">
            <i class="large">shopping_basket</i>
          </button>
          <button class="no-margin" data-ui="#dropdown3_">
            <i class="large">account_circle</i>
            <div id="dropdown3_" data-ui="#dropdown3_" class="dropdown left no-wrap">
              <a>Auteurs : <b>Schneider Macxence</b> et <b>Pere-Tastet Hadrien</b></a>
            </div>
          </button>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col s3 m2 l2" style="position:sticky; top: 10px;">
        <!-- ______________________________________________________ Filtres -->
      
        <aside>
          <h5>Filtres</h5>
          <h6>Catégories</h6>          
          <div>
            ${state.filters.categories.representation}
          </div>
          <div class="small-space"></div>
          <h6>Origines</h6>
          <div>
            ${state.filters.origins.representation}
          </div>
          <div class="small-space"></div>
          <h6>Recherche</h6>
          ${state.filters.search.representation}
          <div class="small-space"></div>          
          <h5>Paramètres</h5>
          ${this.settingsUI(model,state)}
          
        </aside>

      </div>
      <div class=" col s9 m10 l10">
        <!-- ___________________________________ Récap filtres et recherche -->
        
        
        <div class="row top-align no-margin">
          <nav class="col s8 wrap no-margin">
            ${this.filtersSearchTagsUI(model,state)}
            <!-- ${state.filteredArticles.representation}   -->
          </nav>
          <nav class="col s4 right-align no-margin">
            ${this.articlesViewUI(model,state)}
          </nav>
        </div>
        
        <!-- _____________________________________________________ Articles -->
        
        ${state.filteredArticles.representation}  
      
        <!-- ___________________________________________________ Pagination -->
        ${this.paginationUI(model,state)}
        
        
      </div>
    </div>
  </div>
  <!-- ______________________________________________________________Panier -->
  ${state.cart.representation}
  `;
  },
  
  darkThemeUI(model) {
    const bodyclass = document.body.classList;
    if (model.settings.darkTheme) bodyclass.add   ('is-dark');
    else                          bodyclass.remove('is-dark');
  },
  
  filterUI(model, state, filterName) {
    console.log('filterUI', filterName);
    console.log(Object.entries(model));
    console.log(Object.entries(state));
    
    let filtre1 = state.filters[filterName];
    let filtre2 = model.filters[filterName];
    let fifi = Object.keys(filtre1.booleans);
    let coche = '';  // réinitialiser coche ici (avant d'itérer sur fifi)

    console.log("filterUI fifi", fifi);
    fifi.sort((a, b) => a.localeCompare(b));  // trie par ordre alphabétique
    
    console.log("filterUI fi1", filtre1);
    console.log("filterUI fi2", filtre2);

    let fifi_html = fifi.map(fifi => {
        coche = '';  // Réinitialiser coche à chaque itération
        let count = filtre2.count ? filtre2.count[fifi] || 0 : 0;
        console.log("filterUI count", count);
    
        if (filtre1.booleans[fifi] === true) {
          coche = 'checked="checked"';
        }

        return `
            <div>
                <label class="checkbox">
                    <input type="checkbox" onchange="samActions.exec({do:'filterToggle', use: '${fifi}', util: '${filterName}'})" ${coche} />
                    <span class="capitalize">${fifi}</span>
                    <a><span class="badge circle right color-2-text color-2a">${count}</span></a>
                </label>
            </div>
        `;
    }).join('');

    let allcoche = filtre1.toutes ? 'checked="checked"' : '';
    let all = 0;
    if (filtre2.count) {
        all = Object.values(filtre2.count).reduce((a, b) => a + b, 0);
    }

    let toto_hmtl = `
        <div>
            <label class="checkbox">
                <input type="checkbox" onchange="samActions.exec({do:'LeTOUT', bool: ${filtre1.toutes}, util: '${filterName}'})" ${allcoche} />
                <span class="capitalize">toutes</span>
                <a><span class="badge circle right color-2-text color-2a">${all}</span></a>
            </label>
        </div>
    `;

    console.log("filterUI jltomy", toto_hmtl);  // ptdr il s'affiche bien en pkus se grand fouu

    return this.html`
        ${toto_hmtl}
        ${fifi_html}
    `;
},

  
  searchUI(model, state) {
    
    console.log('searchUI');


    const text = model.filters.search.text || '';
    const glob = model.filters.search.global;


    return this.html`
      <div class="middle-align small-margin">
        <label class="switch">
          <input 
            type="checkbox" 
            onchange="samActions.exec({do:'Recherchetoogle'})"
            ${glob ? 'checked="checked"' : ''}
          />
          <span>globale</span>
        </label>
      </div>
      <div class="field prefix round fill border small">
        <i>search</i>
        <input 
          onchange="samActions.exec({do:'Updatesearch', valeur: this.value})" 
          type="text" 
          class="align-middle" 
          value="${text}" 
          placeholder="Rechercher un article"
        />
      </div>    
    `;
  },
  
  settingsUI(model,state) {
    const withImageChecked  = model.settings.articleImages ? 'checked="checked"' : '';
    const darkThemeChecked  = model.settings.darkTheme     ? 'checked="checked"' : '';
    const animationsChecked = model.settings.animations    ? 'checked="checked"' : '';
    
    return this.html`
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.exec({do:'imagesToggle'})" ${withImageChecked} />
          <span>Articles <br />avec images</span>
        </label>
      </div>
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.exec({do:'animationsToggle'})" ${animationsChecked} />
          <span>Animations</span>
        </label>
      </div>          
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.exec({do:'darkThemeToggle'})" ${darkThemeChecked} />
          <span>Thème <br /> sombre</span>
        </label>
      </div>          
          `;
  },
  
  filtersSearchTagsUI(model, state) {
  
    console.log('filtersSearchTagsUI');
    
     
    let catcck = Object.keys(state.filters.categories.booleans).filter(cat => state.filters.categories.booleans[cat]);catcck.sort((a, b) => a.localeCompare(b));
    
    
    const disabled = model.filters.search.global ? 'color-2b-text' : '';

    const tagsCategories = catcck.map(cat => `<span class="chip small no-margin capitalize ${disabled}" onclick="samActions.exec({do:'filterToggle', use: '${cat}', util: 'categories'})">${cat}<i class="small">close </i></span>`).join('');

    const orgcck = Object.keys(state.filters.origins.booleans).filter(org => state.filters.origins.booleans[org]);orgcck.sort((a, b) => a.localeCompare(b));
    const tagsOrigins = orgcck.map(org => `<span class="chip small no-margin capitalize ${disabled}" onclick="samActions.exec({do:'filterToggle', use: '${org}', util: 'origins'})"> ${org}<i class="small">close</i></span>`).join('');


    const search = state.filters.search.text;
    const searchTag = search ? `<span class="chip small no-margin" onclick="samActions.exec({do:'FiltreSupression'})">Rech : "${search}"<i class="small">close</i></span>`: '';

    const Arcticleslength = state.filteredArticles.values.length;
    return this.html`<label class="medium-text color-2-text">${Arcticleslength} articles -</label>${tagsCategories}${tagsOrigins}${searchTag}`;
  },
  
  articlesViewUI(model, state) {
    
    const gridOn = state.display.articlesView.value == 'grid';
    const gridViewClass    = gridOn ? 'disabled' : '';
    const gridViewDisabled = gridOn ? 'disabled="disabled"' : '';
    const listViewClass    = gridOn ? '' : 'disabled';
    const listViewDisabled = gridOn ? '' : 'disabled="disabled"';
  
    return this.html`
      <button onclick="samActions.exec({do:'gridListView', view:'list'})" class="small no-margin ${listViewClass}" ${listViewDisabled}>
        <i>view_list</i></button>
      <button onclick="samActions.exec({do:'gridListView', view:'grid'})" class="small           ${gridViewClass}" ${gridViewDisabled}>
        <i>grid_view</i></button>
    `;
  },
  
  inEuro(number) {
    const numString = (number + 0.0001) + '';
    const dotIndex  = numString.indexOf('.');
    return numString.substring(0, dotIndex+3)+' €';
  },
  
  articlesGridUI(model, state) {
    console.log('articlesGridUI');
    let grid_html = '';


    
    const pageatm = state.pagination.grid.currentPage - 1;
    const nbitem = state.pagination.grid.maxArticlesPerLine;
    const nbligne = state.pagination.grid.linesPerPage;
    const fifiac = [];
    
    
    console.log("CA",pageatm);
    console.log("CAA",nbitem);
    console.log("CAAA",nbligne);

    
    for(let i= pageatm*nbitem*nbligne ;i<pageatm*nbitem + nbitem*nbligne ; i++){
      if(state.filteredArticles.values[i] !== undefined){
        fifiac[i]=state.filteredArticles.values[i];
    }
    }
    if(fifiac.length === 0){
      grid_html = this.articlesEmptyUI(model,state);
    }else{
    
      fifiac.forEach(act => {
      const picss = model.settings.articleImages ? `<div class="card-image center-align"><img src="./images/${act.pictures[0]}" /></div>` : '';
        grid_html += `
            <div class="card no-padding small-margin">${picss}
              <div class="small-padding">
                <h6 class="no-margin">${act.name}</h6>
                <div class="small-margin"><label>Origine : </label>${act.origin}</div>
                <div class="chip large">
                <label>Prix: </label><span class="large-text"> ${act.price.toFixed(2)} € / <span class="avoidwrap">${act.unit}</span> </span>
                </div>
                <div class="row no-margin">
                <div class="col s8 field round fill border center-align">
                    <input type="text" class="center-align ${act.inCart ? 'color-4': 'color-1a' }" value="${act.quantity !=0 ? act.quantity : ''}" 
                      onchange="samActions.exec({do:'EditCart', id : '${act.id}', valeur: this.value })"/>
                    <label>Quantité</label>
                  </div>
                  <div class="col s4">
                    <button class="circle no-margin ${act.quantity !=0 ? '': 'disabled'}" ${act.quantity !=0 ? '': 'disabled="disabled"'} 
                        ${act.quantity !=0 ? `onclick="samActions.exec({do:'AddCart', id : '${act.id}' })"` : ''}>
                      <i>${act.inCart ? 'edit': 'add'}</i> 
                    </button>
                  </div>
              </div>
            </div>
            </div>
      `;
    });
  };

    return this.html`<article class="small-margin grid-view">${grid_html}</article>`;
  },
  
  articlesListUI(model, state) {
    
    console.log('articlesListUI');

    let list_html='';

    const pageatm = state.pagination.list.currentPage - 1;
    const nbligne = state.pagination.list.linesPerPage ;
    const fifiac = [];

    console.log("BA",pageatm);
    console.log("BAA",nbligne);
  
 
    const startIndex = pageatm * nbligne;
    const endIndex = startIndex + nbligne;

    state.filteredArticles.values.forEach((article, index) => {
      if (index >= startIndex && index < endIndex) {
        fifiac[index] = article;
      }
    });

  
  if(fifiac.length === 0){
    list_html = this.articlesEmptyUI(model,state);
  }else{
    fifiac.forEach(act =>{
      const image = model.settings.articleImages ? `<div class="col min"><img src="./images/${act.pictures[0]}" class="circle tiny" /></div>` : '';
      list_html+=`
        <nav  class="row card divider no-wrap">            
          ${image}
          <div class="col">
            <h6>${act.name}</h6>
            <label>${act.origin}</label>
          </div>
          <div class="col min chip no-margin">
            <label>Prix : </label><span class="large-text"> ${act.price.toFixed(2)} / Pièce</span>
          </div>
          <div class="col min field round fill small border center-align no-margin">
            <label>Qté : </label>
            <input type="text" value="${act.quantity !=0 ? act.quantity : '' }" class="center-align ${act.inCart ? 'color-4': 'color-1a' }"
            onchange="samActions.exec({do:'EditCart', id : '${act.id}', valeur: this.value })" />
          </div>
          <div class="col min no-margin"></div>
          <div class="col min">
            <button class="circle no-margin ${act.quantity !=0 ? '': 'disabled'}"  ${act.quantity !=0 ? '': 'disabled="disabled"'}
            ${act.quantity !=0 ? `onclick="samActions.exec({do:'AddCart', id : '${act.id}' })"` : ''}>
              <i>${act.inCart ? 'edit': 'add' }</i>
            </button>
          </div>
        </nav>
        `;
      });};
          return this.html`<article class="large-margin list-view"> ${list_html} </article>`;
  },
  
  articlesEmptyUI(model,state) {
    return this.html`
      <div class="row">
        <div class="col s12 medium-padding fond">
          <img src="./images/fond.png" class="responsive" />
        </div>
      </div>
    `;
  },
  
  paginationUI(model, state) {
    
    console.log('paginationUI');

  
    const actview = state.display.articlesView.value;
    console.log("ZA",actview);

    const Page = state.pagination;
    console.log("ZAA",Page);

    const pageatm = Page[actview].currentPage;
    console.log("ZAAA",pageatm);

    let nbpage;
    if (Page[actview].numberOfPages > 1000000) {  //pour contrer le pb, il nous a motnrer ça
        nbpage = 0;
    } else {
        nbpage = Page[actview].numberOfPages;
    } 
    console.log("ZAAAA",nbpage);
    
    const premier = pageatm === 1;
    console.log("ZAAAAA",premier);

    const derniere = pageatm === nbpage;
    console.log("ZAAAAAA",derniere);

    const ligne = Page[actview].linesPerPageOptions;
    console.log("ZAAAAAAA",ligne);
    
    const papou = Page[actview].linesPerPage;
    console.log("ZAAAAAAA",papou);

    //ptdrrrrr l'attaque des console.log; les console.log contre attaque 
    let zoui ='';

    let losboutones = '';
    
  
    if(nbpage != 0){
      for(let i=1; i<nbpage+1 ; i++){
        losboutones += `<button class="square no-margin ${i == pageatm ? 'border' : ''}" onclick="samActions.exec({do:'ChangementPage', page: ${i}, util : '${actview}' })" >${i}</button> `;
      }
      for(let j=0; j < ligne.length ; j++){
        zoui += `<option value="${ligne[j]}" ${papou == ligne[j] ? 'selected="selected"' :''} 
        > ${ligne[j]} ligne par page </option>`
      }
      return this.html`
        <nav class="center-align">
          <button class="square ${premier ? 'border disabled' : ''}" ${premier ? 'disabled="disabled"' : ''} onclick="samActions.exec({do:'ChangementPage', page: ${pageatm-1}, util : '${actview}' })">
            <i>navigate_before</i>
          </button>     
          ${losboutones}      
          <button class="square ${derniere ? 'border disabled' : ''}" ${derniere ? 'disabled="disabled"' : ''} onclick="samActions.exec({do:'ChangementPage', page: ${pageatm+1}, util : '${actview}' })">
            <i>navigate_next</i>
          </button>
          <div class="field suffix small">
            <select onchange="samActions.exec({do:'ChangementLigne', valeur: this.value, util : '${actview}' })">
              ${zoui}
            </select>
            <i>arrow_drop_down</i>
          </div>
        </nav>
      `;
    }
  else{
    return this.html``;
  }
  },
  
  cartUI(model, state) {
    console.log('cartUI')
   
    if (!model.display.cartView) return '';


    const Tab_cart_html = state.cart.values.map((act, index) => {
        return this.html`
          <tr class="${index % 2 === 0 ? 'ligne-paire' : 'ligne-impaire'}">
            <td class="left-align">${act.name}</td>
            <td class="quantite">
              <div class="field fill small">
                <input type="text" class="right-align" value="${act.quantity}" 
                onchange="samActions.exec({do:'EditCart', id : '${act.id}', valeur: this.value, quantity: this.value })" />
              </div>
            </td>
            <td class="left-align">${act.unit || ''}</td>
            <td>${act.price.toFixed(2)} €</td>
            <td>${(act.price * act.quantity).toFixed(2)} €</td>
            <td class="center-align">
              <label class="checkbox">
                <input type="checkbox" ${act.check ? 'checked="checked"' : ''}
                  onchange="samActions.exec({ do: 'toggleInCart', id: '${act.id}' })" />
                <span></span>
              </label>
            </td>
          </tr>
        `;
    }).join('');
    




    return this.html`
      <div class="panier row small-margin">
        <div class="col s0 m1 l2"></div>
        <section class="col s12 m10 l8">
          <div class="card">
            <h4>Panier</h4>
            <div>
              <table border="0" class="right-align large-text">
                <thead>
                  <tr>
                    <th class="center-align" onclick="samActions.exec({ do: 'NomCaddieTrie'})" >
                      <a>Articles <i class="small">unfold_more</i></a>
                    </th>
                    <th class="center-align" onclick="samActions.exec({ do: 'QuantiterCaddieTrie'})">
                      <a>Qté <i class="small">unfold_more</i></a>
                    </th>
                    <th class="center-align">Unit</th>
                    <th class="center-align">P.U.</th>
                    <th class="center-align" onclick="samActions.exec({ do: 'PrixCaddieTrie'})">
                      <a>Prix <i class="small">unfold_more</i></a>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${Tab_cart_html}
                </tbody>
                <tfoot class="orange-light-3">
                  <tr>
                    <th colspan="4">Total :</th>
                    <th>${state.cart.total.toFixed(2)} €</th>
                    <th class="center-align">
                      <button type="button" onclick="samActions.exec({ do: 'cartDelete' })" 
                      class="small ${state.cart.values.some(act => act.check == true) ? '' : 'disabled'} "><i>delete</i></button>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="medium-margin right-align">
              <button 
                onclick="envoyerCommande('Tata et Toto', samState.state.cart.values, ${state.cart.total.toFixed(2)})">
                <i class="small-margin">send</i> Envoyer la commande
              </button>
            </div>
          </div>
        </section>
      </div>
    `;
  },
   
};


function envoyerCommande(client, articles, total) {
    
  let commande = articles.map(article => {return ` - ${article.name} (${article.quantity} ${article.unit})`;}).join('\n');
  
  let email = 'commandes@fruits-legumes.com';
  let sujet = 'Commande de ' + client;
  let corps = `

Bonjour,

Je souhaite passer une commande de fruits et légumes pour la semaine à venir. Voici les articles que je désire :

${commande}

Tout cela pour un montant de ${samView.inEuro(total)}.

Merci beaucoup. 

<3


  `;
  email = encodeURIComponent(email);
  sujet = encodeURIComponent(sujet);
  corps = encodeURIComponent(corps);
  const uri = "mailto:" + email + "?subject=" + sujet + "&body=" + corps;
  window.open(uri);
  
}