import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import AddItem from './components/AddItem';
import Search from './components/Search';
import Reminders from './components/Reminders';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/" component={ItemList} />
          <Route path="/item/:id" component={ItemDetail} />
          <Route path="/add" component={AddItem} />
          <Route path="/search" component={Search} />
          <Route path="/reminders" component={Reminders} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
