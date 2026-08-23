interface MenuItem {
  name: string;
  price?: number | string;
  description?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface MenuProps {
  categories?: MenuCategory[];
}

export function Menu({ categories = [] }: MenuProps) {
  if (categories.length === 0) {
    return <section className="menu menu--empty">Menu coming soon.</section>;
  }

  return (
    <section className="menu">
      {categories.map((category) => (
        <div key={category.name} className="menu__category">
          <h3>{category.name}</h3>
          {category.items.map((item) => (
            <div key={item.name} className="menu__item">
              <span className="menu__item-name">{item.name}</span>
              {item.price && <span className="price">{item.price}</span>}
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
