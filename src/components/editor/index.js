// Import React dependencies.
import React, { useCallback, useEffect, useRef, useState } from "react";

import ReactDOM  from "react-dom";
// Import the Slate editor factory.
import { createEditor, Descendant, Editor, Transforms } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact, RenderElementProps, ReactEditor } from "slate-react";


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
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [showPortal,setShowPortal] = useState(true)
  const [editor] = useState(() => withEditableVoids(withReact(createEditor())));
  const [commandList,setCommandList] = useState([])

  
  const initialValue= [
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ];


  const editorChangeHandler = (value) => {
    console.log(value);
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
            console.log(event.target.value);
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
  

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <IcdCodeInput {...props} />;
      default:
        return <div {...props.attributes}>{props.children}</div>;
    }
  }, []);


  const onKeyDownHandler = (event) => {
      if (event.key === '/') {
        event.preventDefault()
        // Determine whether any of the currently selected blocks are code blocks.
        const [match] = Editor.nodes(editor, {
          match: n => n.type === 'code',
        })
        // Toggle the block type depending on whether there's already a match.
        Transforms.setNodes(
          editor,
          { type: match ? 'paragraph' : 'code' }
        )
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
          <Portal>
{     showPortal &&       <div style={{
              top: '-9999px',
              left: '-9999px',
              position: 'absolute',
              zIndex: 1,
              padding: '3px',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)',
            }} ref={ref}>
              {commandOptions.map((command, index) => {
                return <div  key={index} onClick={()=>{
                  Transforms.setNodes(editor, { type: command })
                }}>{command}</div>
              })}
            </div>}
          </Portal>
        </Slate>
      </div>
    </>
  );
};

export default EditorComponent;
