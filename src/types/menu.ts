
export type Category = {
  id: string;      
  label: string;   
};

export const CATEGORIES: Category[] = [
  { id: "pizzas",   label: "Pizzas"   },
  { id: "burgers",  label: "Burgers"  },
  { id: "sides",    label: "Sides"    },
  { id: "drinks",   label: "Drinks"   },
  { id: "desserts", label: "Desserts" },
];

export type MenuItem = {
  id:            string;
  name:          string;
  description:   string;
  price:         number;
  available:     boolean;
  imageUrl?:     string;   
  createdAt?:    unknown;
  categoryId:    string;
  categoryLabel: string;
};


export type MenuItemFormData = {
  name:        string;
  description: string;
  price:       string;    
  categoryId:  string;
  available:   boolean;
  imageFile?:  File | null;   
};

export const EMPTY_FORM: MenuItemFormData = {
  name:        "",
  description: "",
  price:       "",
  categoryId:  CATEGORIES[0].id,
  available:   true,
  imageFile:   null,
};