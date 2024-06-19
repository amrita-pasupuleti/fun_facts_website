import "./Fff-style.css";
import supabase from "./supabase";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6", catStyle: "tech-button" },
  { name: "science", color: "#16a34a", catStyle: "science-button" },
  { name: "society", color: "#8b5cf6", catStyle: "society-button" },
  { name: "history", color: "#d8ad00", catStyle: "history-button" },
];

/*

} */

function Fff() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading /*setIsLoading*/] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        //setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: facts /*, error */ } = await query.limit(500);

        setFacts(facts);

        //if (!error) setFacts(facts);
        //else alert("There was a problem getting data. Try again later.");

        //setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? <Loader /> : <FactList facts={facts} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="loading-message">Loading info . . .</p>;
}

//--------------------------------------------------------------------------------------------------------
//HEADER

function Header({ showForm, setShowForm }) {
  const appTitle = "FFF";
  return (
    <div className="fffheader">
      <div className="logo">
        <h1 className="fffh1">{appTitle}</h1>
        <h2 className="fffh2">Favorite Fun Facts</h2>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Add A New Fact"}
      </button>
    </div>
  );
}

//--------------------------------------------------------------------------------------------------------
//ADDING A NEW FACT

function isValidUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    //prevents browser reload
    e.preventDefault();
    console.log(text, source, category);

    //check if valid, then create a new fact
    if (text && isValidUrl(source) && category && textLength <= 200) {
      //create a new fact object
      setIsUploading(true);
      const { data: newFact } = await supabase
        .from("facts")
        .insert([{ text: text, source: source, category: category }])
        .select();
      setIsUploading(false);
      //add fact to ui and table
      setFacts((facts) => [newFact[0], ...facts]);
      //reset input fields
      setText("");
      setSource("");
      setCategory("");
      //close form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share your fact here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        value={source}
        type="text"
        placeholder="Source's URL"
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

//--------------------------------------------------------------------------------------------------------
//SIDE BUTTONS

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="filter-buttons">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="filter-buttons">
            <button
              className={`btn ${cat.catStyle}`}
              onClick={() => setCurrentCategory(cat.name)}
              style={{ backgroundColor: cat.color }}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

//--------------------------------------------------------------------------------------------------------
//LIST OF FACTS
function FactList({ facts }) {
  if (facts.length === 0) {
    return (
      <p className="facts-info no-facts">
        No facts for this category yet. Add your own!
      </p>
    );
  }

  return (
    <section className="facts-list-section">
      <ul className="facts-list">
        {" "}
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} />
        ))}
      </ul>
      <p className="facts-info">
        There are {facts.length} facts in the database. Add your own!
      </p>
    </section>
  );
}

function Fact({ fact }) {
  return (
    <li className="fact">
      <p>{fact.text}</p>
      <a className="source" href={fact.source}>
        (Source)
      </a>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
    </li>
  );
}

export default Fff;

//--------------------------------------------------------------------------------------------------------
