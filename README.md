# 1. What is the difference between `Component` and `PureComponent`?
### Give an example where it might break my app.

**ANSWER:**

- **Regular Component:**  
  A regular `Component` does not implement `shouldComponentUpdate` by default. This means that any change in props, state, or a re-render of its parent component will cause the component to re-render, regardless of whether the change actually affects the output.

- **PureComponent:**  
  A `PureComponent` implements a shallow comparison in `shouldComponentUpdate` and only re-renders when there are changes in its state or props. This shallow comparison only checks the first level of properties. If your props or state are objects or arrays, `PureComponent` might not detect deep changes, which could lead to bugs.

### Example where it might break the app (class component, with `PureComponent`):

```javascript
import React, { PureComponent } from 'react';

class UserList extends PureComponent {
  render() {
    return (
      <div>
        {this.props.users.map((user, index) => (
          <div key={index}>
            <h3>{user.name}</h3>
            <ul>
              {user.tasks.map((task, taskIndex) => (
                <li key={taskIndex}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

class App extends React.Component {
  state = {
    users: [
        { name: 'William', tasks: ['Task 1', 'Task 2'] },
        { name: 'Margo', tasks: ['Task A', 'Task B'] }
    ]
  };

  addTaskToAlice = () => {
    const updatedUsers = [...this.state.users];

    // Mutating William's tasks array, causes a bug
    updatedUsers[0].tasks.push('Task 3');

    // To fix it, we need to create a new tasks array
    updatedUsers[0] = {
      ...updatedUsers[0],
      tasks: [...updatedUsers[0].tasks, 'Task 3']
    };

    this.setState({ updatedUsers });
  };

  render() {
    return (
      <div>
        <button onClick={this.addTaskToAlice}>Add Task to Alice</button>
        <UserList users={this.state.users} />
      </div>
    );
  }
}

export default App;
```


### Example where it might break the app (functional component, with `React.memo`):

```javascript
import React, { useState } from 'react';

const UserList = React.memo(({ users }) => {
  return (
    <div>
      {users.map((user, index) => (
        <div key={index}>
          <h3>{user.name}</h3>
          <ul>
            {user.tasks.map((task, taskIndex) => (
              <li key={taskIndex}>{task}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});

const App = () => {
  const [users, setUsers] = useState([
    { name: 'William', tasks: ['Task 1', 'Task 2'] },
    { name: 'Margo', tasks: ['Task A', 'Task B'] }
  ]);

  const addTaskToWilliam = () => {
    const updatedUsers = [...users];

    // Mutating William's tasks array, cause bug
    updatedUsers[0].tasks.push('Task 3');

    //To fix it, we need to create a new tasks array
    updatedUsers[0] = {
      ...updatedUsers[0],
      tasks: [...updatedUsers[0].tasks, 'Task 3']
    };

    setUsers(updatedUsers);
  };

  return (
    <div>
      <button onClick={addTaskToAlice}>Add Task to William</button>
      <UserList users={users} />
    </div>
  );
};

export default App;
```

# 2. `Context` + `ShouldComponentUpdate` might be dangerous. Why is that?

**ANSWER:**

Using ShouldComponentUpdate in a component that consumes context can be risky because it might prevent the component from re-rendering when the context changes, leading to stale or outdated values being used. This can cause misalignment between the component's state and context, resulting in unpredictable behavior. Additionally, it complicates debugging, as it becomes harder to determine why a component isn't updating as expected. The small performance gains from using ShouldComponentUpdate might not be worth the potential for subtle, difficult-to-trace bugs.

# 3. Describe 3 ways to pass information from a component to its PARENT.

**ANSWER:**

### Examples:

#### 1. Callback Functions with Parameters
In this approach, the parent component passes a callback function to the child as a prop. The child component calls this function and passes the data as arguments to it.

```javascript
// Parent Component
import React, { useState } from 'react';
import ChildComponent from './ChildComponent';

function ParentComponent() {
  const [data, setData] = useState('');

  const handleData = (dataFromChild) => {
    setData(dataFromChild);
  };

  return (
    <div>
      <h1>Data from Child: {data}</h1>
      <ChildComponent sendDataToParent={handleData} />
    </div>
  );
}

// Child Component
import React from 'react';

function ChildComponent({ sendDataToParent }) {
  const sendData = () => {
    sendDataToParent('Hello, Parent!');
  };

  return (
    <div>
      <button onClick={sendData}>Send Data to Parent</button>
    </div>
  );
}

export default ParentComponent;
```

#### 2. Using Context API for Shared State.
In this method, both the parent and child components consume a shared context. The child component updates the context value, which the parent component then reads.

```javascript
import React, { useState, useContext, createContext } from 'react';

const DataContext = createContext();

// Parent Component
function ParentComponent() {
  const [sharedData, setSharedData] = useState('');

  return (
    <DataContext.Provider value={{ sharedData, setSharedData }}>
      <div>
        <h1>Data from Child: {sharedData}</h1>
        <ChildComponent />
      </div>
    </DataContext.Provider>
  );
}

// Child Component
function ChildComponent() {
  const { setSharedData } = useContext(DataContext);

  const updateData = () => {
    setSharedData('Updated data from Child');
  };

  return (
    <div>
      <button onClick={updateData}>Update Context Data</button>
    </div>
  );
}

export default ParentComponent;
```

#### 3. Using a Callback with useCallback Hook
If the parent component wants to ensure that the callback function doesn’t get recreated on every render, it can use the useCallback hook. This is useful for performance optimization and to prevent unnecessary re-renders of child components.

```javascript
// Parent Component
import React, { useState, useCallback } from 'react';
import ChildComponent from './ChildComponent';

function ParentComponent() {
  const [data, setData] = useState('');

  const handleData = useCallback((dataFromChild) => {
    setData(dataFromChild);
  }, []);

  return (
    <div>
      <h1>Data from Child: {data}</h1>
      <ChildComponent sendDataToParent={handleData} />
    </div>
  );
}

// Child Component
import React from 'react';

function ChildComponent({ sendDataToParent }) {
  const sendData = () => {
    sendDataToParent('Hello Parent!');
  };

  return (
    <div>
      <button onClick={sendData}>Send Data to Parent</button>
    </div>
  );
}

export default ParentComponent;
```

#### 4. Using a Ref Callback
This method involves using a ref callback to set a function on the parent that can be invoked by the child.

```javascript
// Parent Component
import React, { useRef } from 'react';
import ChildComponent from './ChildComponent';

function ParentComponent() {
  const handleData = useRef((data) => {
    console.log(data);
  }).current;

  return (
    <div>
      <h1>Check Console for Data from Child</h1>
      <ChildComponent handleData={handleData} />
    </div>
  );
}

// Child Component
import React, { useEffect } from 'react';

function ChildComponent({ handleData }) {
  useEffect(() => {
    handleData('Data from Child');
  }, [handleData]);

  return <div>Child Component</div>;
}

export default ParentComponent;
```

### 5. Using Custom Events with useEffect
The child component dispatches a custom event, and the parent component listens for this event using useEffect.

```javascript
// Parent Component
import React, { useEffect } from 'react';
import ChildComponent from './ChildComponent';

function ParentComponent() {
  useEffect(() => {
    const handleEvent = (e) => {
      console.log(e.detail);
    };

    window.addEventListener('customEvent', handleEvent);

    return () => {
      window.removeEventListener('customEvent', handleEvent);
    };
  }, []);

  return (
    <div>
      <h1>Listening for Custom Event from Child</h1>
      <ChildComponent />
    </div>
  );
}

// Child Component
import React, { useEffect } from 'react';

function ChildComponent() {
  useEffect(() => {
    const event = new CustomEvent('customEvent', { detail: 'Data from Child' });
    window.dispatchEvent(event);
  }, []);

  return <div>Child Component</div>;
}

export default ParentComponent;
```

# 4. Give 2 ways to prevent components from re-rendering.

**ANSWER:**

- **React.memo:**  
React.memo prevents re-renders by performing a shallow comparison of the component’s props. If the props haven’t changed, the component will not re-render.

```javascript
import React from 'react';

const ChildComponent = React.memo(({ data }) => {
  return <>{data}</>;
});

function ParentComponent() {
  const [data, setData] = React.useState('Hello');

  return (
    <>
      <ChildComponent data={data} />
      <button onClick={() => setData('Hello')}>Update Data</button>
    </>
  );
}

export default ParentComponent;
```

- **useCallback and useMemo Hooks:**
These hooks help to optimize performance by memoizing functions and computed values so that they are not recreated on every render, which can prevent unnecessary re-renders in child components that depend on them.

```javascript

import React, { useState, useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  return (
    <>
      <ChildComponent onIncrement={increment} />
      <p>Count: {count}</p>
    </>
  );
}

function ChildComponent({ onIncrement }) {
  return <button onClick={onIncrement}>Increment</button>;
}

export default ParentComponent;


import React, { useState, useMemo } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  const expensiveCalculation = useMemo(() => {
    return count * 2;
  }, [count]);

  return (
    <div>
      <p>Expensive Calculation Result: {expensiveCalculation}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  );
}

export default ParentComponent;

```


# 5. What is a fragment and why do we need it? Give an example where it might break my app.

**ANSWER:**

When you return multiple elements from a component, React requires them to be wrapped in a single parent element. This often leads developers to use unnecessary <div> or other elements just to satisfy this requirement. However, these extra elements can clutter the DOM and might cause issues with styling, layout, or accessibility.

Fragment solves this problem by allowing you to group multiple elements together without adding any extra elements to the DOM. This keeps the DOM structure clean and avoids unwanted side effects.

```javascript
{cars.map((car) => {
        return (
          // can't add key, classes or styles to <></>
          < key={car.name} style={{padding: 0;}}>
            <h3>{car.name}</h3>
            <button className='car'>{car.icon}</button>
          </>
        );
      })}

{cars.map((car) => {
        return (
            // you can add key to React.Fragment, but still no classes or styles
            <React.Fragment key={car.name}>
            <h3>{car.name}</h3>
            <button className='car'>{car.icon}</button>
            </React.Fragment>
        );
})}
```

# 6. Give 3 examples of the HOC pattern.

**ANSWER:**

The Higher-Order Component (HOC) pattern in React.js is a powerful tool for reusing component logic. An HOC is a function that takes a component as an argument and returns a new component with additional props or behavior.

#### 1. withLoader HOC
The HOC displays a loading spinner while the wrapped component is fetching data.

```javascript
import React from 'react';

const withLoader = (WrappedComponent) => {
  return function WithLoader({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
};

// Usage
const DataComponent = ({ data }) => <div>Data: {data}</div>;
const DataComponentWithLoader = withLoader(DataComponent);

// Render
<DataComponentWithLoader isLoading={true} />;

```

#### 2. withAuth HOC
The HOC checks if a user is authenticated and either renders the wrapped component or redirects to a login page.

```javascript
import React from 'react';
import { Redirect } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
  return function WithAuth(props) {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    return <WrappedComponent {...props} />;
  };
};

// Usage
const Dashboard = (props) => <div>Welcome to the Dashboard</div>;
const DashboardWithAuth = withAuth(Dashboard);

// Render
<DashboardWithAuth />;
```

#### 3. withErrorBoundary HOC
This HOC catches errors in the wrapped component and displays a fallback UI instead.

```javascript
import React, { Component } from 'react';

const withErrorBoundary = (WrappedComponent, FallbackComponent) => {
  return class WithErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true };
    }

    componentDidCatch(error, info) {
      console.error("Error caught by Error Boundary: ", error, info);
    }

    render() {
      if (this.state.hasError) {
        return <FallbackComponent />;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
};

// Usage
const ErrorFallback = () => <div>Something went wrong!</div>;
const ComponentThatMayFail = (props) => {
  if (props.fail) throw new Error("Failed!");
  return <div>Component Loaded Successfully</div>;
};

const SafeComponent = withErrorBoundary(ComponentThatMayFail, ErrorFallback);

// Render
<SafeComponent fail={true} />;
```

# 7. What's the difference in handling exceptions in promises, callbacks and async...await?

**ANSWER:**

#### 1. Promises
Errors in promises can be caught using .catch().

```javascript
function doSomething() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const error = Math.random() > 1 ? new Error("Something went wrong!") : null;
            if (error) {
                reject(error);
            } else {
                resolve("Success!");
            }
        }, 1000);
    });
}

doSomething()
    .then(result => {
        console.log("Result:", result);
    })
    .catch(error => {
        console.error("Error:", error);
    });
```

#### 2. async/await
Errors can be caught using try/catch blocks.

```javascript
async function doSomething() {
    const error = Math.random() > 1 ? new Error("Something went wrong!") : null;
    if (error) {
        throw error;
    }
    return "Success!";
}

async function run() {
    try {
        const result = await doSomething();
        console.log("Result:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}

run();
```

#### 3. Callbacks
Error handling with callbacks typically follows a convention where the first argument to the callback function is reserved for an error, if any.

```javascript
function doSomething(callback) {
    // Simulate an asynchronous operation
    setTimeout(() => {
        const error = Math.random() > 1 ? new Error("Something went wrong!") : null;
        const result = "Success!";
        callback(error, result);
    }, 1000);
}

doSomething((err, result) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("Result:", result);
    }
});
```

# 8. How many arguments does setState take and why is it async.

**ANSWER:**

SetState takes 2 arguments.

- **New state value (or a function to update state):**  
It's the first argument and can be either a value that represents the new state or a function that takes the previous state and props as arguments and returns the new state.

- **Callback function (optional):**
It's the second argument, a function that is called after the state has been updated and the component has re-rendered. It's useful when you want to perform an action after the state change is complete.

- **Why is it async:**
setState is async primarily to optimize performance. React batches multiple state updates and re-renders into a single update to avoid unnecessary re-rendering. This means that when you call setState, the state doesn't update immediately. Instead, React schedules the update and processes it later, potentially grouping it with other updates to minimize the number of re-renders.

This asynchronous nature also allows React to control and prioritize the update process, ensuring that higher priority updates, such as those from user interactions, are handled promptly, while lower priority updates can be deferred to improve performance and responsiveness.


# 9. List the steps needed to migrate a Class to Function Component.

**ANSWER:**

#### 1. Replace the render method with the function body itself.
#### 2. Use props instead of this.props directly.
#### 3. Use the useState hook to manage state instead of this.state in constructor.
#### 4. Replace lifecycle methods (componentDidMount, componentDidUpdate, componentWillUnmount) with useEffect.
```javascript
import React, { useState, useEffect } from 'react';

function MyComponent(props) {
  const [key, setKey] = useState('initialValue');

  // useEffect to handle componentDidMount and componentWillUnmount
  useEffect(() => {
    console.log('Component mounted');
    // Perform side effect, like data fetching

    return () => {
      console.log('Component will unmount');
      // Clean up, like removing event listeners
    };
  }, []); // Empty dependency array ensures this runs only once, like componentDidMount

  // useEffect to handle componentDidUpdate logic
  useEffect(() => {
    console.log('Component updated. New key:', key);
  }, [key]); // This runs whenever 'key' changes, like componentDidUpdate

  return (
    <div>
      <p>{key}</p>
      <button onClick={() => setKey('newValue')}>Change Key</button>
    </div>
  );
}

```
#### 5. Replace this.state with state variables and this.setState with the state setter function.
#### 6. Since the function component does not use this, remove all instances of it.
#### 7. Convert class method to functions.
#### 8. Refactor event handlers. In class components, event handlers (like onClick, onChange, etc.) are often methods of the class and are typically passed as this.methodName. In a function component, you simply pass the function reference directly.

```javascript
//Class component
class MyComponent extends React.Component {
  handleClick() {
    console.log('Button clicked');
  }

  render() {
    return (
      <button onClick={this.handleClick.bind(this)}>Click me</button>
    );
  }
}

//Function component
function MyComponent(props) {
  const handleClick = () => {
    console.log('Button clicked');
  };

  return <button onClick={handleClick}>Click me</button>;
}

```

# 10. List a few ways styles can be used with components.

**ANSWER:**

- **Inline Styles:**
Styles are defined directly within the component using a style attribute, passed as a JavaScript object.

```javascript
<button style={{ backgroundColor: 'blue', color: 'white' }}>Click Me</button>
```

- **CSS/SCSS Stylesheets:**
CSS or SCSS files are used to define styles, which are then imported into the component.

- **CSS Modules:**
CSS files where class names are scoped locally by default, imported as a module in the component.

```javascript
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click Me</button>;
}
```

- **Styled Components (CSS-in-JS):**
A library for writing component-level styles in JavaScript using tagged template literals.

```javascript
import styled from 'styled-components';

const Button = styled.button`
  background-color: blue;
  color: white;
`;

function App() {
  return <Button>Click Me</Button>;
}
```

- **Tailwind CSS:**
Utility-first CSS framework that allows you to apply styles directly through classes.

```javascript
function Button() {
  return <button className="bg-blue-500 text-white p-2">Click Me</button>;
}
```

# 11. How to render an HTML string coming from the server.
React provides the dangerouslySetInnerHTML attribute specifically for injecting raw HTML into the DOM. It should be used cautiously to avoid XSS vulnerabilities. To ensure the HTML string is safe to render, you should sanitize it before using dangerouslySetInnerHTML, using DOMPurify.

```javascript
import DOMPurify from 'dompurify';

function HtmlRenderer({ html }) {
  const cleanHTML = DOMPurify.sanitize(html);

  return (
    <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
  );
}
```

Or possible to use libraries like react-html-parser.
