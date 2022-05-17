// Import React dependencies.
import React, { useEffect, useRef, useState } from "react";

import ReactDOM  from "react-dom";
// Import the Slate editor factory.
import { createEditor, Editor, Node, Transforms } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, ReactEditor } from "slate-react";


const withEditableVoids = editor => {
  const { isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'editable-void' ? true : isVoid(element)
  }

  return editor
}

export const Portal = ({ children }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

const commandOptions = [
  'ICD-10 Codes',
  'CPT Codes',
  'Heading 1',
  'Heading 2',
  'Heading 3'

]




const EditorComponent = () => {
  const ref = useRef()
  const [target, setTarget] = useState()
  const [commandIndex, setCommandIndex] = useState(0)
  const [commandSearch, setCommandSearch] = useState('')
  const [showCommandMenu,setShowcommandMenu] = useState(false)
  // const withIcdCodes = editor => {
  //   const { isInline, isVoid } = editor
  
  //   editor.isInline = element => {
  //     return element.type === 'code' ? false : isInline(element)
  //   }
  
  //   editor.isVoid = element => {
  //     return element.type === 'code' ? false : isVoid(element)
  //   }
  
  //   return editor
  // }
  const [editor] = useState(() => withEditableVoids(withReact(createEditor())));
  const [commandList,setCommandList] = useState([])

  const [commandMode,setCommandMode] = useState(false)

  
  const initialValue= [
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ];

  

  useEffect(() => {
    if (target && commandList.length > 0) {
      const el = ref.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      el.style.top = `${rect.top + window.pageYOffset + 24}px`
      el.style.left = `${rect.left + window.pageXOffset}px`
    }
  }, [commandList.length, editor, commandIndex, commandSearch, target])

  useEffect(()=>{
    const newCommandList = commandOptions.filter(command=>{
      return command.toLowerCase().includes(commandSearch.toLowerCase())
    })
    setCommandList(newCommandList)
  },[commandSearch])


  const editorChangeHandler = (value) => {
    const {selection,children} = editor
    if(commandMode){
      const currentNode  = Node.get(editor,selection.anchor.path)
      setTarget(selection)
      const currentText = currentNode.text
      const searchText = currentText.split('@')[1]
      setCommandSearch(searchText ?? '')
    }
    console.log(children)

  };

  const IcdCodeInput = (props) => {
    const [value, setValue] = useState("");
    const [IcdCodes,setIcdCodes] = useState([]);
    useEffect(()=>{
      Transforms.setNodes(editor, { type: 'code', data:[...IcdCodes] });
    },[IcdCodes])
  
    const IcdCodeOptions = [
      'A00',
      'A01',
      'A02',
      'A03',
    ]
    return (
      <div {...props.attributes}>
      <div
        style={{
          width: "100%",
          background: "blue",
        }}
        contentEditable={false}
      >
        <h2 style={{color:"white"}}>Enter ICD Codes: </h2>
        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          style={{ border: "1px solid black", borderRadius: "5px" }}
        /> <button onClick={()=>{
          setIcdCodes([...IcdCodes,value])
          setValue("")
        }}>Add ICD codes</button>
        {
          IcdCodes.map((code,index)=>{
            return <div key={index} style={{color:"white"}} onClick={()=>{
              setIcdCodes(IcdCodes.filter((c)=>c!==code))
            }}>{code}</div>
          })
        }
      </div>
      {props.children}
      </div>
    );
  };
  

  const renderElement = (props) => {
    console.log('renderElement',props)
    switch (props.element.type) {
      case "code":
        return <IcdCodeInput {...props} />;
      default:
        return <div {...props.attributes}>{props.children}</div>;
    }
  }

  const executeCommand = () => {
    const {selection,children} = editor
    const currentNode  = Node.get(editor,selection.anchor.path)
    switch(commandOptions[commandIndex]){
      case 'ICD-10 Codes':{
        console.log('ICD-10 Codes',selection)
        Editor.deleteBackward(editor,{unit:'character'})
        Transforms.insertNodes(editor, { type: 'code', data:['ICD-10 Codes'],children: [{ text: ''}]
      });

        break
      }
      case 'CPT Codes':{
        console.log('CPT Codes')
        break
    }
    case 'Heading 1':{
      console.log('Heading 1')
      break
    }
    default:{
      console.log('default')
    }
    }

  }

  const onKeyDownHandler = (event) => {
      if(event.key === '@'){
        setShowcommandMenu(true)
        setCommandMode(true)
        setCommandList(commandOptions)
      }else if(event.key === 'Escape'){
        setShowcommandMenu(false)
        setCommandMode(false)
        setCommandList([])
        setTarget()
      }else if(commandMode && event.key === 'ArrowDown'){
        event.preventDefault()
        setCommandIndex(commandIndex+1)
      }else if(commandMode && event.key === 'ArrowUp'){
        event.preventDefault()
        setCommandIndex(commandIndex-1)
      }else if(commandMode && event.key.length === 1 && /[a-z]/.test(event.key)){
        if(commandList.length ===0){
          setShowcommandMenu(false)
        setCommandMode(false)
        setTarget()
        }
      }else if(commandMode && event.key === 'Enter'){
        event.preventDefault()
        setShowcommandMenu(false)
        setCommandMode(false)
        setTarget()
        executeCommand()
      }else if(event.key === 'Enter'){
        event.preventDefault()
        Editor.insertNode(editor,{type:'paragraph',children:[{text:''}]})
      }
      
    }  

  return (
    <>
      <div>Slate Editor</div>
      <div style={{ background: "white" }}>
        <Slate
          editor={editor}
          value={initialValue}
          onChange={editorChangeHandler}
        >
          <Editable
            renderElement={renderElement}
            onKeyDown={onKeyDownHandler}
          />
{     showCommandMenu &&       <div style={{
            position: "absolute",
              zIndex: 1,
              padding: '3px',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)',
            }} ref={ref}>
              {commandList.map((command, i) => {
                return <div  key={i} style={i===commandIndex ? {background:"blue", color:"white"} : {}} onClick={()=>{
                  Transforms.setNodes(editor, { type: command })
                }}>{command}</div>
              })}
            </div>}
        </Slate>
      </div>
    </>
  );
};

export default EditorComponent;


// if (event.key === '/') {
//   event.preventDefault()
//   // Determine whether any of the currently selected blocks are code blocks.
//   const [match] = Editor.nodes(editor, {
//     match: n => n.type === 'code',
//   })
//   // Toggle the block type depending on whether there's already a match.
//   Transforms.setNodes(
//     editor,
//     { type: match ? 'paragraph' : 'code' }
//   )
// }