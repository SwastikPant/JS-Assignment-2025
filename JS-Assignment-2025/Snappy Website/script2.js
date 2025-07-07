let categories = [];

async function loadCategories(){
  const response=await fetch('http://43.205.110.71:8000/categories');
  categories=await response.json();
  const select=document.getElementById('category-select');

  categories.forEach(cat=>{
    const option=document.createElement('option');
    option.value=cat.category;
    option.textContent=cat.category+" ("+cat.count+")";
    select.appendChild(option);
  });
}

  document.querySelector('[data-tab="categories"]').addEventListener('click', ()=>{
    document.getElementById('category-selector').style.display='block';
    if (categories.length===0) loadCategories();
  });

document.getElementById('category-select').addEventListener('change', async (e)=>{
  const catId=e.target.value;
  const response=await fetch(`http://43.205.110.71:8000/categories/${catId}/items`);
  const items=await response.json();
  const container=document.getElementById('items-container');

  container.innerHTML=items.map(item=> `
    <div class="item">
    <h1>Item Name: ${item.name}</h1>
    <p>ID: ${item.id}</p>
    <p>Category: ${item.category}</p>
    <p>Price: ${item.price}</p>
    <p>SKU: ${item.sku}</p>
    <p>Brand: ${item.brand}</p>
    <p>Subcategory: ${item.subcategory}</p>
    <p>Description: ${item.description}</p>
    <p>Weight(kg): ${item.weight_kg}</p>
    <p>Dimensions(cm): ${item.dimensions_cm}</p>
    <p>Stock: ${item.stock}</p>
    <p>Tags: ${item.tags}</p>
    </div>
  `)
});

const tags = ["sale", "new", "lux", "popular", "limited" , "eco"];
const select2=document.getElementById('tag-select');

tags.forEach(tag=>{
  const option=document.createElement('option');
  option.value=tag;
  option.textContent=tag;
  select2.appendChild(option);
})

document.querySelector('[data-tab="tags"]').addEventListener('click', ()=>{
  document.getElementById('tag-selector').style.display='block';
});

document.getElementById('tag-select').addEventListener('change', async (e)=>{
  const selectedTag=e.target.value;
  const response=await fetch('http://43.205.110.71:8000/items');
  const items=await response.json();
  const filteredItems=items.filter(item=> 
    item.description?.includes(`${selectedTag}`) 
  );

  const container2=document.getElementById('items-container');
  container2.innerHTML=filteredItems.map(item=> `
    <div class="item">
    <h1>Item Name: ${item.name}</h1>
    <p>ID: ${item.id}</p>
    <p>Category: ${item.category}</p>
    <p>Price: ${item.price}</p>
    <p>SKU: ${item.sku}</p>
    <p>Brand: ${item.brand}</p>
    <p>Subcategory: ${item.subcategory}</p>
    <p>Description: ${item.description}</p>
    <p>Weight(kg): ${item.weight_kg}</p>
    <p>Dimensions(cm): ${item.dimensions_cm}</p>
    <p>Stock: ${item.stock}</p>
    <p>Tags: ${item.tags}</p>
    </div>
  `)
});