import * as React from 'react';
import { useState, useEffect, FormEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridValueGetterParams
} from '@mui/x-data-grid'
import { collection, doc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { getAuth } from '@firebase/auth'
import { getDB, getFirebaseApp } from '@/lib/firebase/utils/init'
import { logOut } from '@/lib/firebase/hooks'

type Todos = Array<Todo>;

type Todo = {
  id: number;
  item: string;
  done: Boolean;
};

function TodoPage() {
  const [uid, setUid] = useState<String>('');
  const [todos, setTodos] = useState<Todos>([]);
  const hasTodos = todos && todos.length > 0

  const firebaseApp = getFirebaseApp()
  const auth = getAuth(firebaseApp)
  auth.onAuthStateChanged((user) => {
    if (user) setUid(user.uid)
  })

  const columns: GridColDef[] = [
    {
      field: 'item',
      headerName: 'item',
      width: 150,
      editable: false,
      renderCell: ({ row }: GridRenderCellParams) => {
        const style: SxProps<Theme> = row.done ? { 'text-decoration': 'line-through' } : { 'text-decoration': 'none' }
        return <Box sx={style}>{ row.item }</Box>
      },
      valueGetter: ({ row }: GridValueGetterParams) => {
        return row.done
      }
    },
    {
      field: 'done',
      headerName: 'done',
      width: 150,
      renderCell: ({ row }: GridRenderCellParams) => {
        const done = !row.done ? '未' : '済'
        return <Switch checked={row.done} onClick={() => changeDone(row.id)} />
      },
      valueGetter: ({ row }: GridValueGetterParams) => {
        return !row.done ? '未' : '済'
      }
    },
    {
      field: 'deleteBtn',
      headerName: '削除',
      sortable: false,
      width: 90,
      renderCell: ({ row }: GridRenderCellParams) => {
        return <Button onClick={() => deleteTodo(row.id)}>削除</Button>
      }
    }
  ]
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // @see: {https://kamatimaru.hatenablog.com/entry/2021/02/13/062753}
    const eventTarget = event.currentTarget as HTMLFormElement
    const todo: HTMLInputElement | null = eventTarget.elements.namedItem(
      'todo',
    ) as HTMLInputElement;
    const newTodo = {
      item: todo.value as string,
      done: false
    }
    const list: Array<Todo> = [...todos, newTodo].map((obj, index) => {
      return {
        id: index + 1,
        item: obj.item,
        done: obj.done
      }
    })
    const db = getDB()
    const contentsCollectionRef = doc(db, 'todos', uid as string);
    await updateDoc(contentsCollectionRef, { list });
    refresh()
  };

  const deleteTodo = async (id: number) => {
    const list = [...todos].filter(item => item.id !== id)
    const db = getDB()
    const contentsCollectionRef = doc(db, 'todos', uid as string);
    await updateDoc(contentsCollectionRef, { list });
    refresh()
  };

  const changeDone = async (id: number) => {
    todos.forEach(obj => {
      if (obj.id === id) obj.done = !obj.done
    })
    const db = getDB()
    const contentsCollectionRef = doc(db, 'todos', uid as string);
    await updateDoc(contentsCollectionRef, { list: todos });
  };

  const createContentsIfNeed = async () => {
    if (!uid) return
    const db = getDB()
    const contentsCollectionRef = collection(db, 'todos');
    const querySnapshot = await getDocs(contentsCollectionRef)
    const filterd = querySnapshot.docs.filter((doc) => doc.id === uid)
    if (filterd.length === 0) {
      const bbb = doc(db, 'todos', uid as string)
      await setDoc(bbb, { list: [] })
    }
    refresh()
  }

  const refresh = async () => {
    if (!uid) return
    const db = getDB()
    const contentsCollectionRef = collection(db, 'todos');
    const querySnapshot = await getDocs(contentsCollectionRef)
    const filterd = querySnapshot.docs.filter((doc) => doc.id === uid)
    setTodos(filterd[0].data().list.map((obj: Todo, index: number) => {
      return {
        id: index + 1,
        item: obj.item,
        done: obj.done
      }
    }));
  }

  useEffect(() => {
    createContentsIfNeed()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return <>
    <Container component="main">
      <form onSubmit={handleSubmit}>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Grid container text-align="center" columnSpacing="16px" rowSpacing="16px">
            <Grid item sx={{ mr: 1 }}><InputLabel sx={{ mt: '4px' }}>todo</InputLabel></Grid>
            <Grid item sx={{ mr: 1 }}><Input name="todo" type="text" placeholder="todo" /></Grid>
            <Grid item>
              <Button
                type="submit"
                fullWidth
                variant="contained"
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </Box>
      </form>
      { hasTodos &&
        <DataGrid
          rows={(todos as Todos)}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          autoHeight
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          // disableSelectionOnClick
          hideFooterPagination
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
              printOptions: { disableToolbarButton: true },
              csvOptions: { disableToolbarButton: true }
            }
          }}
        />
      }
      <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={logOut}
        >
          Sign Out
      </Button>
    </Container>
  </>
  ;
}

export default TodoPage;